import { query } from "../config/database";
import { parsePagination, buildPaginationMeta, PaginationMeta } from "../utils/pagination.util";
import { ApiError } from "../utils/apiError.util";
import { createNotification } from "./notification.service";

export interface SellerReviewRow {
  id: string;
  seller_id: string;
  reviewer_id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface SellerRatingSummary {
  averageRating: string;
  reviewCount: number;
}

export async function getSellerRatingSummary(sellerId: string): Promise<SellerRatingSummary> {
  const result = await query(
    `SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)::text as avg,
            COUNT(*)::text as count
     FROM seller_reviews WHERE seller_id = $1`,
    [sellerId]
  );
  const row = (result.rows as { avg: string; count: string }[])[0];
  return { averageRating: row.avg, reviewCount: parseInt(row.count, 10) };
}

async function assertSellerExists(sellerId: string): Promise<void> {
  const result = await query("SELECT id FROM users WHERE id = $1 AND is_active = true", [
    sellerId,
  ]);
  if ((result.rows as unknown[]).length === 0) {
    throw ApiError.notFound("Seller not found");
  }
}

export async function listSellerReviews(
  sellerId: string,
  rawQuery: Record<string, unknown>
): Promise<{
  items: SellerReviewRow[];
  meta: PaginationMeta;
  summary: SellerRatingSummary;
}> {
  await assertSellerExists(sellerId);
  const { page, limit, offset } = parsePagination(rawQuery);

  const countResult = await query(
    "SELECT COUNT(*)::text as count FROM seller_reviews WHERE seller_id = $1",
    [sellerId]
  );
  const totalItems = parseInt((countResult.rows as { count: string }[])[0].count, 10);

  const itemsResult = await query(
    `SELECT
       r.id, r.seller_id, r.reviewer_id,
       CONCAT(u.first_name, ' ', LEFT(u.last_name, 1), '.') as reviewer_name,
       r.rating, r.comment, r.created_at
     FROM seller_reviews r
     JOIN users u ON u.id = r.reviewer_id
     WHERE r.seller_id = $1
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [sellerId, limit, offset]
  );

  return {
    items: itemsResult.rows as SellerReviewRow[],
    meta: buildPaginationMeta(page, limit, totalItems),
    summary: await getSellerRatingSummary(sellerId),
  };
}

export async function createSellerReview(
  reviewerId: string,
  sellerId: string,
  input: { rating: number; comment?: string }
): Promise<SellerReviewRow> {
  if (reviewerId === sellerId) {
    throw ApiError.badRequest("You can't review yourself");
  }
  await assertSellerExists(sellerId);

  const existing = await query(
    "SELECT id FROM seller_reviews WHERE seller_id = $1 AND reviewer_id = $2",
    [sellerId, reviewerId]
  );
  if ((existing.rows as unknown[]).length > 0) {
    throw ApiError.conflict("You've already reviewed this seller");
  }

  const inserted = await query(
    `INSERT INTO seller_reviews (seller_id, reviewer_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [sellerId, reviewerId, input.rating, input.comment ?? null]
  );
  const reviewId = (inserted.rows as { id: string }[])[0].id;

  // Best-effort: tell the seller. A notification failure must not fail the review.
  try {
    await createNotification(sellerId, {
      type: "seller_review",
      title: "You received a new review",
      message: `A buyer rated you ${input.rating} out of 5.`,
    });
  } catch {
    // ignore
  }

  const fetched = await query(
    `SELECT
       r.id, r.seller_id, r.reviewer_id,
       CONCAT(u.first_name, ' ', LEFT(u.last_name, 1), '.') as reviewer_name,
       r.rating, r.comment, r.created_at
     FROM seller_reviews r
     JOIN users u ON u.id = r.reviewer_id
     WHERE r.id = $1`,
    [reviewId]
  );
  return (fetched.rows as SellerReviewRow[])[0];
}

export async function deleteMySellerReview(reviewerId: string, sellerId: string): Promise<void> {
  const result = await query(
    "DELETE FROM seller_reviews WHERE seller_id = $1 AND reviewer_id = $2",
    [sellerId, reviewerId]
  );
  if (result.rowCount === 0) {
    throw ApiError.notFound("You haven't reviewed this seller");
  }
}