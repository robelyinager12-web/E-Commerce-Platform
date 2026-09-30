import { query } from "../config/database";
import { parsePagination, buildPaginationMeta, PaginationMeta } from "../utils/pagination.util";
import { ApiError } from "../utils/apiError.util";

export interface AdminUserRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  listing_count: string;
}

export async function listUsers(
  rawQuery: Record<string, unknown>,
  filters: { search?: string; role?: string }
): Promise<{ items: AdminUserRow[]; meta: PaginationMeta }> {
  const { page, limit, offset } = parsePagination(rawQuery);

  const conditions: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (filters.search) {
    conditions.push(`(u.email ILIKE $${i} OR u.first_name ILIKE $${i} OR u.last_name ILIKE $${i})`);
    params.push(`%${filters.search}%`);
    i += 1;
  }
  if (filters.role) {
    conditions.push(`u.role = $${i}::user_role`);
    params.push(filters.role);
    i += 1;
  }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await query(`SELECT COUNT(*)::text as count FROM users u ${whereClause}`, params);
  const totalItems = parseInt((countResult.rows as { count: string }[])[0].count, 10);

  const itemsResult = await query(
    `SELECT
       u.id, u.first_name, u.last_name, u.email, u.phone, u.role, u.is_active, u.created_at,
       (SELECT COUNT(*)::text FROM listings l WHERE l.user_id = u.id) as listing_count
     FROM users u
     ${whereClause}
     ORDER BY u.created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );

  return {
    items: itemsResult.rows as AdminUserRow[],
    meta: buildPaginationMeta(page, limit, totalItems),
  };
}

export async function updateUserAdmin(
  actingAdminId: string,
  targetUserId: string,
  input: { isActive?: boolean; role?: string }
): Promise<void> {
  if (actingAdminId === targetUserId) {
    throw ApiError.badRequest("You can't change your own account through this endpoint");
  }

  const result = await query(
    `UPDATE users SET
       is_active = COALESCE($1, is_active),
       role = COALESCE($2::user_role, role)
     WHERE id = $3`,
    [input.isActive, input.role, targetUserId]
  );
  if (result.rowCount === 0) {
    throw ApiError.notFound("User not found");
  }
}