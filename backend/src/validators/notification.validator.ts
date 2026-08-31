import { param, query } from "express-validator";

export const listNotificationsValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("unreadOnly").optional().isIn(["true", "false"]),
];

export const notificationIdParamValidator = [
  param("id").isUUID().withMessage("Invalid notification id"),
];