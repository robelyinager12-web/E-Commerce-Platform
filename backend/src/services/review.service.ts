import { query, withTransaction } from "../config/database";
import { parsePagination, buildPaginationMeta, PaginationMeta } from "../utils/pagination.util";
import { ApiError } from "../utils/apiError.util";

export interface ReviewRow {
  id: string;
  product_id: string;
  user_id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  is_verified_purchase: boolean;
  created_at: string;
}

/**
 * A purchase counts as "verified" if the user has at least one order
 * containing this product where the order has reached a state that
 * confirms it was actually fulfilled (not just placed and abandoned).
 */
const VERIFIED_PURCHASE_STATUSES = ["confirmed", "processing", "shipped", "delivered"];

async function isVerifiedPurchase(userId: string, productId: string): Promise<boolean> {
  const result = await query(
    `SELECT 1 FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = ANY($3::order_status[])
     LIMIT 1`,
    [userId, productId, VERIFIED_PURCHASE_STATUSES]
  );
  return result.rows.length > 0;
}

async function recalculateAverageRating(
  client: { query: typeof query },
  productId: string
): Promise<void> {
  await client.query(
    `UPDATE products SET average_rating = COALESCE(
       (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE product_id = $1),
       0.0
     ) WHERE id = $1`,
    [productId]
  );
}

export async function listProductReviews(
  productId: string,
  rawQuery: Record<string, unknown>
): Promise<{ items: ReviewRow[]; meta: PaginationMeta }> {
  const { page, limit, offset } = parsePagination(rawQuery);

  const countResult = await query<{ count: string }>(
    "SELECT COUNT(*)::text as count FROM reviews WHERE product_id = $1",
    [productId]
  );
  const totalItems = parseInt(countResult.rows[0].count, 10);

  const itemsResult = await query<ReviewRow>(
    `SELECT
       r.id, r.product_id, r.user_id,
       CONCAT(u.first_name, ' ', LEFT(u.last_name, 1), '.') as reviewer_name,
       r.rating, r.comment, r.is_verified_purchase, r.created_at
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [productId, limit, offset]
  );

  return { items: itemsResult.rows, meta: buildPaginationMeta(page, limit, totalItems) };
}

export async function createReview(
  userId: string,
  productId: string,
  input: { rating: number; comment?: string }
): Promise<ReviewRow> {
  const product = await query("SELECT id FROM products WHERE id = $1 AND is_active = true", [
    productId,
  ]);
  if (product.rows.length === 0) {
    throw ApiError.notFound("Product not found");
  }

  const existing = await query(
    "SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2",
    [productId, userId]
  );
  if (existing.rows.length > 0) {
    throw ApiError.conflict("You've already reviewed this product. Try editing your review instead.");
  }

  const verified = await isVerifiedPurchase(userId, productId);

  const review = await withTransaction(async (client) => {
    const result = await client.query<{ id: string }>(
      `INSERT INTO reviews (product_id, user_id, rating, comment, is_verified_purchase)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [productId, userId, input.rating, input.comment ?? null, verified]
    );
    await recalculateAverageRating(client, productId);
    return result.rows[0].id;
  });

  return getReviewById(review);
}

async function getReviewById(reviewId: string): Promise<ReviewRow> {
  const result = await query<ReviewRow>(
    `SELECT
       r.id, r.product_id, r.user_id,
       CONCAT(u.first_name, ' ', LEFT(u.last_name, 1), '.') as reviewer_name,
       r.rating, r.comment, r.is_verified_purchase, r.created_at
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.id = $1`,
    [reviewId]
  );
  return result.rows[0];
}

export async function updateReview(
  userId: string,
  reviewId: string,
  input: { rating?: number; comment?: string }
): Promise<ReviewRow> {
  const existing = await query<{ user_id: string; product_id: string }>(
    "SELECT user_id, product_id FROM reviews WHERE id = $1",
    [reviewId]
  );
  const review = existing.rows[0];
  if (!review) {
    throw ApiError.notFound("Review not found");
  }
  if (review.user_id !== userId) {
    throw ApiError.forbidden("You can only edit your own reviews");
  }

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE reviews SET
         rating = COALESCE($1, rating),
         comment = COALESCE($2, comment)
       WHERE id = $3`,
      [input.rating, input.comment, reviewId]
    );
    await recalculateAverageRating(client, review.product_id);
  });

  return getReviewById(reviewId);
}

export async function deleteReview(
  userId: string,
  userRole: string,
  reviewId: string
): Promise<void> {
  const existing = await query<{ user_id: string; product_id: string }>(
    "SELECT user_id, product_id FROM reviews WHERE id = $1",
    [reviewId]
  );
  const review = existing.rows[0];
  if (!review) {
    throw ApiError.notFound("Review not found");
  }

  const isOwner = review.user_id === userId;
  const isModerator = ["super_admin", "admin"].includes(userRole);
  if (!isOwner && !isModerator) {
    throw ApiError.forbidden("You can only delete your own reviews");
  }

  await withTransaction(async (client) => {
    await client.query("DELETE FROM reviews WHERE id = $1", [reviewId]);
    await recalculateAverageRating(client, review.product_id);
  });
}