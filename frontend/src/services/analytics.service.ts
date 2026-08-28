import { api, ApiResponse } from "./api";
import {
  OverviewStats,
  SalesOverTimePoint,
  TopProduct,
  LowStockProduct,
  OrderStatusCount,
} from "../types/analytics.types";

export async function fetchOverview(): Promise<OverviewStats> {
  const response = await api.get<ApiResponse<OverviewStats>>("/admin/analytics/overview");
  return response.data.data;
}

export async function fetchSalesOverTime(
  interval: "day" | "week" | "month" = "day"
): Promise<SalesOverTimePoint[]> {
  const response = await api.get<ApiResponse<SalesOverTimePoint[]>>(
    "/admin/analytics/sales-over-time",
    { params: { interval } }
  );
  return response.data.data;
}

export async function fetchTopProducts(limit = 5): Promise<TopProduct[]> {
  const response = await api.get<ApiResponse<TopProduct[]>>("/admin/analytics/top-products", {
    params: { limit },
  });
  return response.data.data;
}

export async function fetchLowStock(): Promise<LowStockProduct[]> {
  const response = await api.get<ApiResponse<LowStockProduct[]>>("/admin/analytics/low-stock");
  return response.data.data;
}

export async function fetchOrderStatusBreakdown(): Promise<OrderStatusCount[]> {
  const response = await api.get<ApiResponse<OrderStatusCount[]>>("/admin/analytics/order-status");
  return response.data.data;
}