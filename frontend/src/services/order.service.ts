import { api } from "./api";
import { AddressInput, OrderDetail, OrderSummary, PaginationMeta } from "../types/order.types";

interface OrderListResponse {
  items: OrderSummary[];
  meta: PaginationMeta;
}

export async function checkout(input: {
  shippingAddress: AddressInput;
  billingAddress?: AddressInput;
  couponCode?: string;
}): Promise<OrderDetail> {
  const response = await api.post("/orders/checkout", input);
  return response.data.data as OrderDetail;
}

export async function fetchMyOrders(page = 1): Promise<OrderListResponse> {
  const response = await api.get("/orders", { params: { page } });
  return response.data.data as OrderListResponse;
}

export async function fetchMyOrderById(orderId: string): Promise<OrderDetail> {
  const response = await api.get(`/orders/${orderId}`);
  return response.data.data as OrderDetail;
}

// --- Admin ---

export async function fetchAllOrdersAdmin(page = 1, status?: string): Promise<OrderListResponse> {
  const response = await api.get("/orders/admin/all", { params: { page, status } });
  return response.data.data as OrderListResponse;
}

export async function fetchOrderByIdAdmin(orderId: string): Promise<OrderDetail> {
  const response = await api.get(`/orders/admin/${orderId}`);
  return response.data.data as OrderDetail;
}

export async function updateOrderStatusAdmin(
  orderId: string,
  status: string,
  note?: string
): Promise<OrderDetail> {
  const response = await api.patch(`/orders/admin/${orderId}/status`, { status, note });
  return response.data.data as OrderDetail;
}