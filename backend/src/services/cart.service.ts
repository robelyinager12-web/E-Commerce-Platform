import { query, withTransaction } from "../config/database";
import { ApiError } from "../utils/apiError.util";

export interface CartContext {
  userId?: string;
  sessionId?: string;
}

export interface CartItemView {
  id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  product_slug: string;
  variant_name: string | null;
  variant_value: string | null;
  quantity: number;
  price_at_add: string;
  line_total: string;
  primary_image: string | null;
  available_stock: number;
}

export interface CartView {
  id: string;
  items: CartItemView[];
  subtotal: string;
  itemCount: number;
}

async function findCartId(client: { query: typeof query }, context: CartContext): Promise<string | null> {
  if (context.userId) {
    const result = await client.query<{ id: string }>(
      "SELECT id FROM cart WHERE user_id = $1",
      [context.userId]
    );
    return result.rows[0]?.id ?? null;
  }

  if (context.sessionId) {
    const result = await client.query<{ id: string }>(
      "SELECT id FROM cart WHERE session_id = $1",
      [context.sessionId]
    );
    return result.rows[0]?.id ?? null;
  }

  return null;
}

async function getOrCreateCartId(context: CartContext): Promise<string> {
  const existing = await findCartId({ query }, context);
  if (existing) {
    return existing;
  }

  const result = await query<{ id: string }>(
    `INSERT INTO cart (user_id, session_id) VALUES ($1, $2) RETURNING id`,
    [context.userId ?? null, context.sessionId ?? null]
  );
  return result.rows[0].id;
}

async function fetchCartView(cartId: string): Promise<CartView> {
  const itemsResult = await query<CartItemView>(
    `SELECT
       ci.id,
       ci.product_id,
       ci.variant_id,
       p.name as product_name,
       p.slug as product_slug,
       pv.variant_name,
       pv.variant_value,
       ci.quantity,
       ci.price_at_add::text,
       (ci.price_at_add * ci.quantity)::text as line_total,
       (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image,
       COALESCE(pv.stock_quantity, p.stock_quantity) as available_stock
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     LEFT JOIN product_variants pv ON pv.id = ci.variant_id
     WHERE ci.cart_id = $1
     ORDER BY ci.id`,
    [cartId]
  );

  const items = itemsResult.rows;
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.line_total), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cartId,
    items,
    subtotal: subtotal.toFixed(2),
    itemCount,
  };
}

export async function getCart(context: CartContext): Promise<CartView> {
  const cartId = await findCartId({ query }, context);
  if (!cartId) {
    return { id: "", items: [], subtotal: "0.00", itemCount: 0 };
  }
  return fetchCartView(cartId);
}

async function resolveUnitPriceAndStock(
  productId: string,
  variantId?: string
): Promise<{ price: number; stock: number }> {
  const productResult = await query<{ base_price: string; stock_quantity: number; is_active: boolean }>(
    "SELECT base_price::text, stock_quantity, is_active FROM products WHERE id = $1",
    [productId]
  );
  const product = productResult.rows[0];
  if (!product || !product.is_active) {
    throw ApiError.notFound("Product not found");
  }

  if (variantId) {
    const variantResult = await query<{ price_adjustment: string; stock_quantity: number }>(
      "SELECT price_adjustment::text, stock_quantity FROM product_variants WHERE id = $1 AND product_id = $2",
      [variantId, productId]
    );
    const variant = variantResult.rows[0];
    if (!variant) {
      throw ApiError.badRequest("Variant does not belong to the specified product");
    }
    return {
      price: parseFloat(product.base_price) + parseFloat(variant.price_adjustment),
      stock: variant.stock_quantity,
    };
  }

  return { price: parseFloat(product.base_price), stock: product.stock_quantity };
}

export async function addItemToCart(
  context: CartContext,
  input: { productId: string; variantId?: string; quantity: number }
): Promise<CartView> {
  const { price, stock } = await resolveUnitPriceAndStock(input.productId, input.variantId);

  const cartId = await getOrCreateCartId(context);

  await withTransaction(async (client) => {
    const existing = await client.query<{ id: string; quantity: number }>(
      `SELECT id, quantity FROM cart_items
       WHERE cart_id = $1 AND product_id = $2
         AND variant_id IS NOT DISTINCT FROM $3`,
      [cartId, input.productId, input.variantId ?? null]
    );

    const existingItem = existing.rows[0];
    const newQuantity = (existingItem?.quantity ?? 0) + input.quantity;

    if (newQuantity > stock) {
      throw ApiError.badRequest(
        `Only ${stock} unit(s) available for this item (you already have ${existingItem?.quantity ?? 0} in your cart)`
      );
    }

    if (existingItem) {
      await client.query("UPDATE cart_items SET quantity = $1 WHERE id = $2", [
        newQuantity,
        existingItem.id,
      ]);
    } else {
      await client.query(
        `INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, price_at_add)
         VALUES ($1, $2, $3, $4, $5)`,
        [cartId, input.productId, input.variantId ?? null, input.quantity, price]
      );
    }

    await client.query("UPDATE cart SET updated_at = NOW() WHERE id = $1", [cartId]);
  });

  return fetchCartView(cartId);
}

export async function updateCartItemQuantity(
  context: CartContext,
  itemId: string,
  quantity: number
): Promise<CartView> {
  const cartId = await findCartId({ query }, context);
  if (!cartId) {
    throw ApiError.notFound("Cart not found");
  }

  const itemResult = await query<{ id: string; product_id: string; variant_id: string | null }>(
    "SELECT id, product_id, variant_id FROM cart_items WHERE id = $1 AND cart_id = $2",
    [itemId, cartId]
  );
  const item = itemResult.rows[0];
  if (!item) {
    throw ApiError.notFound("Cart item not found");
  }

  const { stock } = await resolveUnitPriceAndStock(item.product_id, item.variant_id ?? undefined);
  if (quantity > stock) {
    throw ApiError.badRequest(`Only ${stock} unit(s) available for this item`);
  }

  await query("UPDATE cart_items SET quantity = $1 WHERE id = $2", [quantity, itemId]);
  return fetchCartView(cartId);
}

export async function removeCartItem(context: CartContext, itemId: string): Promise<CartView> {
  const cartId = await findCartId({ query }, context);
  if (!cartId) {
    throw ApiError.notFound("Cart not found");
  }

  const result = await query("DELETE FROM cart_items WHERE id = $1 AND cart_id = $2", [
    itemId,
    cartId,
  ]);
  if (result.rowCount === 0) {
    throw ApiError.notFound("Cart item not found");
  }

  return fetchCartView(cartId);
}

export async function clearCart(context: CartContext): Promise<CartView> {
  const cartId = await findCartId({ query }, context);
  if (cartId) {
    await query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
  }
  return { id: cartId ?? "", items: [], subtotal: "0.00", itemCount: 0 };
}

/**
 * Merges a guest session's cart into the authenticated user's cart,
 * called right after login. Guest item quantities are added on top of
 * any existing quantities in the user's cart (bounded by stock), and the
 * now-empty guest cart is removed.
 */
export async function mergeGuestCartIntoUser(sessionId: string, userId: string): Promise<void> {
  const guestCart = await query<{ id: string }>("SELECT id FROM cart WHERE session_id = $1", [
    sessionId,
  ]);
  const guestCartId = guestCart.rows[0]?.id;
  if (!guestCartId) return;

  const guestItems = await query<{
    product_id: string;
    variant_id: string | null;
    quantity: number;
  }>("SELECT product_id, variant_id, quantity FROM cart_items WHERE cart_id = $1", [guestCartId]);

  for (const item of guestItems.rows) {
    try {
      await addItemToCart(
        { userId },
        {
          productId: item.product_id,
          variantId: item.variant_id ?? undefined,
          quantity: item.quantity,
        }
      );
    } catch {
      // Skip items that fail (e.g. now out of stock or deactivated) rather
      // than blocking the whole login flow over a single stale cart line.
    }
  }

  await query("DELETE FROM cart_items WHERE cart_id = $1", [guestCartId]);
  await query("DELETE FROM cart WHERE id = $1", [guestCartId]);
}