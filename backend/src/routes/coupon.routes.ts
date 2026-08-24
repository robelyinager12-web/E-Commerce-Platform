import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createCouponValidator,
  updateCouponValidator,
  couponIdParamValidator,
  validateCouponValidator,
} from "../validators/coupon.validator";
import {
  getCoupons,
  getCoupon,
  postCoupon,
  patchCoupon,
  removeCoupon,
  postValidateCoupon,
} from "../controllers/coupon.controller";

const router = Router();

// --- Public: preview a coupon's discount before checkout ---
router.post("/validate", validateCouponValidator, validate, postValidateCoupon);

// --- Admin only ---
router.use(authenticate, requireRole("super_admin", "admin"));

router.get("/", getCoupons);
router.get("/:id", couponIdParamValidator, validate, getCoupon);
router.post("/", createCouponValidator, validate, postCoupon);
router.patch("/:id", updateCouponValidator, validate, patchCoupon);
router.delete("/:id", couponIdParamValidator, validate, removeCoupon);

export default router;