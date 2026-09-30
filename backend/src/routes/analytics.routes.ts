import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import {
  getOverviewStats,
  getCategoryBreakdown,
  getTopSellersStats,
} from "../controllers/analytics.controller";

const router = Router();

router.use(authenticate, requireRole("super_admin", "admin", "staff"));

router.get("/overview", getOverviewStats);
router.get("/categories", getCategoryBreakdown);
router.get("/top-sellers", getTopSellersStats);

export default router;