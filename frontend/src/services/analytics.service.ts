import { api } from "./api";
import {
  OverviewStats,
  SalesOverTimePoint,
  TopProduct,
  LowStockProduct,
  OrderStatusCount,
} from "../types/analytics.types";

export async function fetchOverview(): Promise<OverviewStats> {
  const response = await api.get("/admin/analytics/overview");
  return response.data.data as OverviewStats;
}

export async function fetchSalesOverTime(
  interval: "day" | "week" | "month" = "day"
): Promise<SalesOverTimePoint[]> {
  const response = await api.get("/admin/analytics/sales-over-time", { params: { interval } });
  return response.data.data as SalesOverTimePoint[];
}

export async function fetchTopProducts(limit = 5): Promise<TopProduct[]> {
  const response = await api.get("/admin/analytics/top-products", { params: { limit } });
  return response.data.data as TopProduct[];
}

export async function fetchLowStock(): Promise<LowStockProduct[]> {
  const response = await api.get("/admin/analytics/low-stock");
  return response.data.data as LowStockProduct[];
}

export async function fetchOrderStatusBreakdown(): Promise<OrderStatusCount[]> {
  const response = await api.get("/admin/analytics/order-status");
  return response.data.data as OrderStatusCount[];
}