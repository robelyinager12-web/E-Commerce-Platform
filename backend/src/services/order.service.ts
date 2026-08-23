import { query, withTransaction } from "../config/database";
import { ApiError } from "../utils/apiError.util";
import { generateOrderNumber } from "../utils/generateOrderId.util";
import { parsePagination, buildPaginationMeta, PaginationMeta } from "../utils/pagination.util";

const TAX_RATE = 0.08; // 8% flat tax, simplified for this project
const FLAT_SHIPPING_COST = 5.99;
const FREE_SHIPPING_THRESHOLD = 50;

interface AddressInput {
  label?: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface OrderSummary {
  id: string;
  order_number: string;
  status: string;
  subtotal: string;
  discount_amount: string;
  shipping_cost: string;
  tax_amount: string;
  total_amount: string;
  created_at: string;
}

export interface OrderItemDetail {
  id: string;
  product_id: string;
  variant_id: string | null;
  product_name_snapshot: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface OrderDetail extends OrderSummary {
  items: OrderItemDetail[];
  shipping_address: AddressInput & { id: string };
  billing_address: AddressInput & { id: string };
  status_history: { status: string; note: string | null; created_at: string }[];
}

async function insertAddress(
  client: { query: typeof query },
  userId: string,
  address: AddressInput
): Promise<string> {
  const result = await client.query<{ id: string }>(
    `INSERT INTO addresses (user_id, label, street, city, state, postal_code, country)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      userId,
      address.label ?? "Order address",
      address.street,
      address.city,
      address.state ?? null,
      address.postalCode,
      address.country,
    ]
  );
  return result.rows[0].id;
}

export async function checkout(
  userId: string,
  input: {
    shippingAddress: AddressInput;
    billingAddress?: AddressInput;
    couponCode?: string;
  }
): Promise<OrderDetail> {
  const cartResult = await query<{ id: string }>("SELECT id FROM cart WHERE user_id = $1", [
    userId,
  ]);
  const cartId = cartResult.rows[0]?.id;
  if (!cartId) {
    throw ApiError.badRequest("Your cart is empty");
  }

  const orderId = await withTransaction(async (client) => {
    // Lock the cart items' underlying product/variant rows for the duration
    // of this transaction so concurrent checkouts can't oversell stock.
    const itemsResult = await client.query<{
      product_id: string;
      variant_id: string | null;
      quantity: number;
      price_at_add: string;
      product_name: string;
    }>(
      `SELECT ci.product_id, ci.variant_id, ci.quantity, ci.price_at_add::text, p.name as product_name
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1
       FOR UPDATE OF ci`,
      [cartId]
    );

    const items = itemsResult.rows;
    if (items.length === 0) {
      throw ApiError.badRequest("Your cart is empty");
    }

    // Re-verify stock at checkout time (locked) and decrement it.
    for (const item of items) {
      const stockTable = item.variant_id ? "product_variants" : "products";
      const stockResult = await client.query<{ stock_quantity: number }>(
        `SELECT stock_quantity FROM ${stockTable} WHERE id = $1 FOR UPDATE`,
        [item.variant_id ?? item.product_id]
      );
      const available = stockResult.rows[0]?.stock_quantity ?? 0;
      if (available < item.quantity) {
        throw ApiError.badRequest(
          `"${item.product_name}" only has ${available} unit(s) left in stock`
        );
      }
      await client.query(`UPDATE ${stockTable} SET stock_quantity = stock_quantity - $1 WHERE id = $2`, [
        item.quantity,
        item.variant_id ?? item.product_id,
      ]);
    }

    const subtotal = items.reduce(
      (sum, item) => sum + parseFloat(item.price_at_add) * item.quantity,
      0
    );

    // --- Coupon validation ---
    let discountAmount = 0;
    let couponId: string | null = null;
    if (input.couponCode) {
      const couponResult = await client.query<{
        id: string;
        discount_type: "percentage" | "fixed";
        discount_value: string;
        min_order_amount: string;
        max_uses: number | null;
        times_used: number;
        is_active: boolean;
        valid_from: string;
        valid_until: string;
      }>("SELECT * FROM coupons WHERE code = $1 FOR UPDATE", [input.couponCode]);
      const coupon = couponResult.rows[0];

      if (!coupon || !coupon.is_active) {
        throw ApiError.badRequest("Invalid or inactive coupon code");
      }
      const now = new Date();
      if (now < new Date(coupon.valid_from) || now > new Date(coupon.valid_until)) {
        throw ApiError.badRequest("This coupon has expired or is not yet valid");
      }
      if (coupon.max_uses !== null && coupon.times_used >= coupon.max_uses) {
        throw ApiError.badRequest("This coupon has reached its usage limit");
      }
      if (subtotal < parseFloat(coupon.min_order_amount)) {
        throw ApiError.badRequest(
          `This coupon requires a minimum order of $${coupon.min_order_amount}`
        );
      }

      discountAmount =
        coupon.discount_type === "percentage"
          ? subtotal * (parseFloat(coupon.discount_value) / 100)
          : parseFloat(coupon.discount_value);
      discountAmount = Math.min(discountAmount, subtotal);
      couponId = coupon.id;

      await client.query("UPDATE coupons SET times_used = times_used + 1 WHERE id = $1", [
        coupon.id,
      ]);
    }

    const shippingCost = subtotal - discountAmount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
    const taxAmount = (subtotal - discountAmount) * TAX_RATE;
    const totalAmount = subtotal - discountAmount + shippingCost + taxAmount;

    // --- Addresses ---
    const shippingAddressId = await insertAddress(client, userId, input.shippingAddress);
    const billingAddressId = input.billingAddress
      ? await insertAddress(client, userId, input.billingAddress)
      : shippingAddressId;

    // --- Order ---
    const orderNumber = generateOrderNumber();
    const orderResult = await client.query<{ id: string }>(
      `INSERT INTO orders (
         order_number, user_id, status, subtotal, discount_amount, shipping_cost,
         tax_amount, total_amount, shipping_address_id, billing_address_id
       ) VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        orderNumber,
        userId,
        subtotal.toFixed(2),
        discountAmount.toFixed(2),
        shippingCost.toFixed(2),
        taxAmount.toFixed(2),
        totalAmount.toFixed(2),
        shippingAddressId,
        billingAddressId,
      ]
    );
    const newOrderId = orderResult.rows[0].id;

    for (const item of items) {
      const lineSubtotal = parseFloat(item.price_at_add) * item.quantity;
      await client.query(
        `INSERT INTO order_items (
           order_id, product_id, variant_id, product_name_snapshot, quantity, unit_price, subtotal
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          newOrderId,
          item.product_id,
          item.variant_id,
          item.product_name,
          item.quantity,
          item.price_at_add,
          lineSubtotal.toFixed(2),
        ]
      );
    }

    if (couponId) {
      await client.query(
        "INSERT INTO order_coupons (order_id, coupon_id) VALUES ($1, $2)",
        [newOrderId, couponId]
      );
    }

    await client.query(
      "INSERT INTO order_status_history (order_id, status, note) VALUES ($1, 'pending', 'Order placed')",
      [newOrderId]
    );

    // Clear the cart now that it has become an order.
    await client.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);

    return newOrderId;
  });

  return getOrderDetail(orderId);
}

export async function getOrderDetail(orderId: string): Promise<OrderDetail> {
  const orderResult = await query
    OrderSummary & { shipping_address_id: string; billing_address_id: string }
  >(
    `SELECT id, order_number, status, subtotal::text, discount_amount::text,
            shipping_cost::text, tax_amount::text, total_amount::text, created_at,
            shipping_address_id, billing_address_id
     FROM orders WHERE id = $1`,
    [orderId]
  );
  const order = orderResult.rows[0];
  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  const [itemsResult, shippingAddr, billingAddr, historyResult] = await Promise.all([
    query<OrderItemDetail>(
      `SELECT id, product_id, variant_id, product_name_snapshot, quantity,
              unit_price::text, subtotal::text
       FROM order_items WHERE order_id = $1`,
      [orderId]
    ),
    query<AddressInput & { id: string }>(
      `SELECT id, label, street, city, state, postal_code as "postalCode", country
       FROM addresses WHERE id = $1`,
      [order.shipping_address_id]
    ),
    query<AddressInput & { id: string }>(
      `SELECT id, label, street, city, state, postal_code as "postalCode", country
       FROM addresses WHERE id = $1`,
      [order.billing_address_id]
    ),
    query<{ status: string; note: string | null; created_at: string }>(
      `SELECT status, note, created_at FROM order_status_history
       WHERE order_id = $1 ORDER BY created_at ASC`,
      [orderId]
    ),
  ]);

  return {
    ...order,
    items: itemsResult.rows,
    shipping_address: shippingAddr.rows[0],
    billing_address: billingAddr.rows[0],
    status_history: historyResult.rows,
  };
}

export async function getOrderForUser(orderId: string, userId: string): Promise<OrderDetail> {
  const ownerCheck = await query<{ user_id: string | null }>(
    "SELECT user_id FROM orders WHERE id = $1",
    [orderId]
  );
  if (ownerCheck.rows.length === 0) {
    throw ApiError.notFound("Order not found");
  }
  if (ownerCheck.rows[0].user_id !== userId) {
    throw ApiError.forbidden("You do not have access to this order");
  }
  return getOrderDetail(orderId);
}

export async function listUserOrders(
  userId: string,
  rawQuery: Record<string, unknown>,
  status?: string
): Promise<{ items: OrderSummary[]; meta: PaginationMeta }> {
  const { page, limit, offset } = parsePagination(rawQuery);

  const conditions = ["user_id = $1"];
  const params: unknown[] = [userId];
  if (status) {
    conditions.push(`status = $${params.length + 1}`);
    params.push(status);
  }
  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*)::text as count FROM orders ${whereClause}`,
    params
  );
  const totalItems = parseInt(countResult.rows[0].count, 10);

  const itemsResult = await query<OrderSummary>(
    `SELECT id, order_number, status, subtotal::text, discount_amount::text,
            shipping_cost::text, tax_amount::text, total_amount::text, created_at
     FROM orders ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  return { items: itemsResult.rows, meta: buildPaginationMeta(page, limit, totalItems) };
}

export async function listAllOrders(
  rawQuery: Record<string, unknown>,
  status?: string
): Promise<{ items: OrderSummary[]; meta: PaginationMeta }> {
  const { page, limit, offset } = parsePagination(rawQuery);

  const conditions: string[] = [];
  const params: unknown[] = [];
  if (status) {
    conditions.push(`status = $${params.length + 1}`);
    params.push(status);
  }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*)::text as count FROM orders ${whereClause}`,
    params
  );
  const totalItems = parseInt(countResult.rows[0].count, 10);

  const itemsResult = await query<OrderSummary>(
    `SELECT id, order_number, status, subtotal::text, discount_amount::text,
            shipping_cost::text, tax_amount::text, total_amount::text, created_at
     FROM orders ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  return { items: itemsResult.rows, meta: buildPaginationMeta(page, limit, totalItems) };
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  note: string | undefined,
  changedBy: string
): Promise<OrderDetail> {
  const orderResult = await query<{ status: string }>("SELECT status FROM orders WHERE id = $1", [
    orderId,
  ]);
  const order = orderResult.rows[0];
  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  const allowedNext = VALID_TRANSITIONS[order.status] ?? [];
  if (!allowedNext.includes(newStatus)) {
    throw ApiError.badRequest(
      `Cannot transition order from "${order.status}" to "${newStatus}"`
    );
  }

  await withTransaction(async (client) => {
    await client.query("UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2", [
      newStatus,
      orderId,
    ]);
    await client.query(
      "INSERT INTO order_status_history (order_id, status, note, changed_by) VALUES ($1, $2, $3, $4)",
      [orderId, newStatus, note ?? null, changedBy]
    );
  });

  return getOrderDetail(orderId);
}