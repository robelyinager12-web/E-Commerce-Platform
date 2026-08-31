import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notification.service";

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const unreadOnly = req.query.unreadOnly === "true";
  const { items, meta, unreadCount } = await listNotifications(
    req.user!.userId,
    req.query as Record<string, unknown>,
    unreadOnly
  );
  sendSuccess(res, "Notifications retrieved", { items, meta, unreadCount });
});

export const patchMarkRead = asyncHandler(async (req: Request, res: Response) => {
  await markNotificationRead(req.user!.userId, req.params.id);
  sendSuccess(res, "Notification marked as read");
});

export const patchMarkAllRead = asyncHandler(async (req: Request, res: Response) => {
  await markAllNotificationsRead(req.user!.userId);
  sendSuccess(res, "All notifications marked as read");
});