import { query } from "../config/database";
import { parsePagination, buildPaginationMeta, PaginationMeta } from "../utils/pagination.util";
import { ApiError } from "../utils/apiError.util";

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

/**
 * Creates a notification for a user. Called internally by other services
 * (e.g. order.service.ts on status change) — never exposed as a public
 * "create notification for anyone" endpoint, since that would let one
 * user spam another.
 */
export async function createNotification(
  userId: string,
  input: { type: string; title: string; message: string }
): Promise<void> {
  await query(
    `INSERT INTO notifications (user_id, type, title, message)
     VALUES ($1, $2, $3, $4)`,
    [userId, input.type, input.title, input.message]
  );
}

export async function listNotifications(
  userId: string,
  rawQuery: Record<string, unknown>,
  unreadOnly: boolean
): Promise<{ items: NotificationRow[]; meta: PaginationMeta; unreadCount: number }> {
  const { page, limit, offset } = parsePagination(rawQuery);

  const conditions = ["user_id = $1"];
  const params: unknown[] = [userId];
  if (unreadOnly) {
    conditions.push("is_read = false");
  }
  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const [countResult, itemsResult, unreadResult] = await Promise.all([
    query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM notifications ${whereClause}`,
      params
    ),
    query<NotificationRow>(
      `SELECT id, user_id, type, title, message, is_read, created_at
       FROM notifications ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    query<{ count: string }>(
      "SELECT COUNT(*)::text as count FROM notifications WHERE user_id = $1 AND is_read = false",
      [userId]
    ),
  ]);

  const totalItems = parseInt(countResult.rows[0].count, 10);

  return {
    items: itemsResult.rows,
    meta: buildPaginationMeta(page, limit, totalItems),
    unreadCount: parseInt(unreadResult.rows[0].count, 10),
  };
}

export async function markNotificationRead(userId: string, id: string): Promise<void> {
  const result = await query(
    "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  if (result.rowCount === 0) {
    throw ApiError.notFound("Notification not found");
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await query("UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false", [
    userId,
  ]);
}