import { query } from "../config/database";
import { ApiError } from "../utils/apiError.util";

export interface WishlistItem {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  base_price: string;
  primary_image: string | null;
  is_active: boolean;
  added_at: string;
}

export async function listWishlist(userId: string): Promise<WishlistItem[]> {
  const result = await query<WishlistItem>(
    `SELECT
       wi.id, wi.product_id, p.name as product_name, p.slug as product_slug,
       p.base_price::text, p.is_active,
       (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image,
       wi.created_at as added_at
     FROM wishlist_items wi
     JOIN products p ON p.id = wi.product_id
     WHERE wi.user_id = $1
     ORDER BY wi.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function addToWishlist(userId: string, productId: string): Promise<WishlistItem[]> {
  const product = await query("SELECT id FROM products WHERE id = $1 AND is_active = true", [
    productId,
  ]);
  if (product.rows.length === 0) {
    throw ApiError.notFound("Product not found");
  }

  await query(
    `INSERT INTO wishlist_items (user_id, product_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, product_id) DO NOTHING`,
    [userId, productId]
  );

  return listWishlist(userId);
}

export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<WishlistItem[]> {
  const result = await query(
    "DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2",
    [userId, productId]
  );
  if (result.rowCount === 0) {
    throw ApiError.notFound("This product is not in your wishlist");
  }

  return listWishlist(userId);
}