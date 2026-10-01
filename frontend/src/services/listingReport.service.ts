import { api } from "./api";
import { ListingReport } from "../types/listingReport.types";
import { PaginationMeta } from "../types/listing.types";

interface ReportsResponse {
  items: ListingReport[];
  meta: PaginationMeta;
}

export async function fetchReportsAdmin(status?: string, page = 1): Promise<ReportsResponse> {
  const response = await api.get("/admin/reports", { params: { status, page } });
  return response.data.data as ReportsResponse;
}

export async function resolveReportAdmin(
  id: string,
  action: "dismiss" | "remove_listing",
  note?: string
): Promise<void> {
  await api.patch(`/admin/reports/${id}`, { action, note });
}