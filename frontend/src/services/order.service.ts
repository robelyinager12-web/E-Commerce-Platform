// ... existing checkout / fetchMyOrders / fetchMyOrderById unchanged, then:

export async function fetchAllOrdersAdmin(
  page = 1,
  status?: string
): Promise<{ items: OrderSummary[]; meta: PaginationMeta }> {
  const response = await api.get<ApiResponse<{ items: OrderSummary[]; meta: PaginationMeta }>>(
    "/orders/admin/all",
    { params: { page, status } }
  );
  return response.data.data;
}

export async function fetchOrderByIdAdmin(orderId: string): Promise<OrderDetail> {
  const response = await api.get<ApiResponse<OrderDetail>>(`/orders/admin/${orderId}`);
  return response.data.data;
}

export async function updateOrderStatusAdmin(
  orderId: string,
  status: string,
  note?: string
): Promise<OrderDetail> {
  const response = await api.patch<ApiResponse<OrderDetail>>(`/orders/admin/${orderId}/status`, {
    status,
    note,
  });
  return response.data.data;
}