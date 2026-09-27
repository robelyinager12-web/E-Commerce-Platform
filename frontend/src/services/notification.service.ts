import { api } from "./api";
import { Notification } from "../types/notification.types";
import { PaginationMeta } from "../types/product.types";

interface NotificationsResponse {
  items: Notification[];
  meta: PaginationMeta;
  unreadCount: number;
}

export async function fetchNotifications(
  unreadOnly = false
): Promise<NotificationsResponse> {
  const response = await api.get("/notifications", { params: { unreadOnly } });
  return response.data.data as NotificationsResponse;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch("/notifications/read-all");
}