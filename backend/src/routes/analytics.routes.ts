import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  dateRangeValidator,
  salesOverTimeValidator,
  topProductsValidator,
  lowStockValidator,
} from "../validators/analytics.validator";
import {
  getOverviewStats,
  getSalesOverTimeStats,
  getTopProductsStats,
  getLowStockStats,
  getOrderStatusStats,
} from "../controllers/analytics.controller";

const router = Router();

router.use(authenticate, requireRole("super_admin", "admin", "staff"));

router.get("/overview", dateRangeValidator, validate, getOverviewStats);
router.get("/sales-over-time", salesOverTimeValidator, validate, getSalesOverTimeStats);
router.get("/top-products", topProductsValidator, validate, getTopProductsStats);
router.get("/low-stock", lowStockValidator, validate, getLowStockStats);
router.get("/order-status", dateRangeValidator, validate, getOrderStatusStats);

export default router;