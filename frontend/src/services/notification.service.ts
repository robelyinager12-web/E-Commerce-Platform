import { api, ApiResponse } from "./api";
import { Notification } from "../types/notification.types";
import { PaginationMeta } from "../types/product.types";

export async function fetchNotifications(
  unreadOnly = false
): Promise<{ items: Notification[]; meta: PaginationMeta; unreadCount: number }> {
  const response = await api.get
    ApiResponse<{ items: Notification[]; meta: PaginationMeta; unreadCount: number }>
  >("/notifications", { params: { unreadOnly } });
  return response.data.data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch("/notifications/read-all");
}