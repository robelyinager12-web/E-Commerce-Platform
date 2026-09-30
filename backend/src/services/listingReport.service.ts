import { query, withTransaction } from "../config/database";
import { parsePagination, buildPaginationMeta, PaginationMeta } from "../utils/pagination.util";
import { ApiError } from "../utils/apiError.util";
import { logAudit } from "../utils/audit.util";
import { createNotification } from "./notification.service";

export interface ListingReportRow {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_status: string;
  reporter_id: string;
  reporter_name: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
}

export async function createListingReport(
  reporterId: string,
  listingId: string,
  input: { reason: string; details?: string }
): Promise<void> {
  const listing = await query(
    "SELECT id, user_id FROM listings WHERE id = $1",
    [listingId]
  );
  const row = (listing.rows as { id: string; user_id: string }[])[0];
  if (!row) {
    throw ApiError.notFound("Listing not found");
  }
  if (row.user_id === reporterId) {
    throw ApiError.badRequest("You can't report your own listing");
  }

  const existing = await query(
    "SELECT id FROM listing_reports WHERE listing_id = $1 AND reporter_id = $2 AND status = 'pending'",
    [listingId, reporterId]
  );
  if ((existing.rows as unknown[]).length > 0) {
    throw ApiError.conflict("You've already reported this listing; it's pending review");
  }

  await query(
    `INSERT INTO listing_reports (listing_id, reporter_id, reason, details)
     VALUES ($1, $2, $3, $4)`,
    [listingId, reporterId, input.reason, input.details ?? null]
  );
}

export async function listReports(
  rawQuery: Record<string, unknown>,
  status?: string
): Promise<{ items: ListingReportRow[]; meta: PaginationMeta }> {
  const { page, limit, offset } = parsePagination(rawQuery);

  const conditions: string[] = [];
  const params: unknown[] = [];
  if (status) {
    conditions.push(`r.status = $${params.length + 1}`);
    params.push(status);
  }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await query(
    `SELECT COUNT(*)::text as count FROM listing_reports r ${whereClause}`,
    params
  );
  const totalItems = parseInt((countResult.rows as { count: string }[])[0].count, 10);

  const itemsResult = await query(
    `SELECT
       r.id, r.listing_id, l.title as listing_title, l.status as listing_status,
       r.reporter_id, CONCAT(u.first_name, ' ', u.last_name) as reporter_name,
       r.reason, r.details, r.status, r.created_at
     FROM listing_reports r
     JOIN listings l ON l.id = r.listing_id
     JOIN users u ON u.id = r.reporter_id
     ${whereClause}
     ORDER BY r.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  return {
    items: itemsResult.rows as ListingReportRow[],
    meta: buildPaginationMeta(page, limit, totalItems),
  };
}

export async function resolveReport(
  reportId: string,
  action: "dismiss" | "remove_listing",
  note: string | undefined,
  adminId: string
): Promise<void> {
  const reportResult = await query(
    "SELECT id, listing_id, status FROM listing_reports WHERE id = $1",
    [reportId]
  );
  const report = (reportResult.rows as { id: string; listing_id: string; status: string }[])[0];
  if (!report) {
    throw ApiError.notFound("Report not found");
  }
  if (report.status !== "pending") {
    throw ApiError.badRequest("This report has already been handled");
  }

  await withTransaction(async (client) => {
    const newStatus = action === "remove_listing" ? "resolved" : "dismissed";
    await client.query("UPDATE listing_reports SET status = $1 WHERE id = $2", [
      newStatus,
      reportId,
    ]);

    if (action === "remove_listing") {
      const listingResult = await client.query(
        "SELECT user_id FROM listings WHERE id = $1",
        [report.listing_id]
      );
      const listingOwnerId = (listingResult.rows as { user_id: string }[])[0]?.user_id;

      await client.query("UPDATE listings SET status = 'removed' WHERE id = $1", [
        report.listing_id,
      ]);

      if (listingOwnerId) {
        try {
          await createNotification(listingOwnerId, {
            type: "listing_removed",
            title: "Your listing was removed",
            message: note
              ? `Your listing was removed by a moderator. ${note}`
              : "Your listing was removed for violating our guidelines.",
          });
        } catch {
          // ignore
        }
      }
    }
  });

  await logAudit({
    userId: adminId,
    action: action === "remove_listing" ? "REPORT_RESOLVED_LISTING_REMOVED" : "REPORT_DISMISSED",
    entityType: "listing_report",
    entityId: reportId,
    metadata: { note },
  });
}