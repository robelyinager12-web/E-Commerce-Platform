import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  checkoutValidator,
  listOrdersValidator,
  orderIdParamValidator,
  updateOrderStatusValidator,
} from "../validators/order.validator";
import {
  postCheckout,
  getMyOrders,
  getMyOrder,
  getAllOrders,
  getAnyOrder,
  patchOrderStatus,
} from "../controllers/order.controller";

const router = Router();

router.use(authenticate);

// --- Customer ---
router.post("/checkout", checkoutValidator, validate, postCheckout);
router.get("/", listOrdersValidator, validate, getMyOrders);
router.get("/:id", orderIdParamValidator, validate, getMyOrder);

// --- Admin / Staff ---
router.get(
  "/admin/all",
  requireRole("super_admin", "admin", "staff"),
  listOrdersValidator,
  validate,
  getAllOrders
);
router.get(
  "/admin/:id",
  requireRole("super_admin", "admin", "staff"),
  orderIdParamValidator,
  validate,
  getAnyOrder
);
router.patch(
  "/admin/:id/status",
  requireRole("super_admin", "admin", "staff"),
  updateOrderStatusValidator,
  validate,
  patchOrderStatus
);

export default router;