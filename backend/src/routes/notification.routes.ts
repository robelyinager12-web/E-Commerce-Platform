import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  listNotificationsValidator,
  notificationIdParamValidator,
} from "../validators/notification.validator";
import {
  getNotifications,
  patchMarkRead,
  patchMarkAllRead,
} from "../controllers/notification.controller";

const router = Router();

router.use(authenticate);

router.get("/", listNotificationsValidator, validate, getNotifications);
router.patch("/read-all", patchMarkAllRead);
router.patch("/:id/read", notificationIdParamValidator, validate, patchMarkRead);

export default router;