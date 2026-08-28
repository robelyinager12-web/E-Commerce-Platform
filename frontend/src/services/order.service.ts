import { api, ApiResponse } from "./api";
import { AddressInput, OrderDetail, OrderSummary, PaginationMeta } from "../types/order.types";

export async function checkout(input: {
  shippingAddress: AddressInput;
  billingAddress?: AddressInput;
  couponCode?: string;
}): Promise<OrderDetail> {
  const response = await api.post<ApiResponse<OrderDetail>>("/orders/checkout", input);
  return response.data.data;
}

export async function fetchMyOrders(
  page = 1
): Promise<{ items: OrderSummary[]; meta: PaginationMeta }> {
  const response = await api.get<ApiResponse<{ items: OrderSummary[]; meta: PaginationMeta }>>(
    "/orders",
    { params: { page } }
  );
  return response.data.data;
}

export async function fetchMyOrderById(orderId: string): Promise<OrderDetail> {
  const response = await api.get<ApiResponse<OrderDetail>>(`/orders/${orderId}`);
  return response.data.data;
}