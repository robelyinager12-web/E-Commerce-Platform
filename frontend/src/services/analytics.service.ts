import { api } from "./api";
import { OverviewStats, CategoryBreakdown, TopSeller } from "../types/analytics.types";

export async function fetchOverview(): Promise<OverviewStats> {
  const response = await api.get("/admin/analytics/overview");
  return response.data.data as OverviewStats;
}

export async function fetchCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  const response = await api.get("/admin/analytics/categories");
  return response.data.data as CategoryBreakdown[];
}

export async function fetchTopSellers(limit = 10): Promise<TopSeller[]> {
  const response = await api.get("/admin/analytics/top-sellers", { params: { limit } });
  return response.data.data as TopSeller[];
}