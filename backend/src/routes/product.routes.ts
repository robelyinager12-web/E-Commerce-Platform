import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createProductValidator,
  updateProductValidator,
  productIdParamValidator,
  listProductsValidator,
} from "../validators/product.validator";
import {
  getProducts,
  getProduct,
  postProduct,
  patchProduct,
  removeProduct,
} from "../controllers/product.controller";

const router = Router();
router.get(
  "/admin/all",
  authenticate,
  requireRole("super_admin", "admin", "staff"),
  getProductsAdmin
);

router.post(
  "/admin/:id/reactivate",
  authenticate,
  requireRole("super_admin", "admin"),
  productIdParamValidator,
  validate,
  postReactivateProduct
);

// --- Public ---
router.get("/", listProductsValidator, validate, getProducts);
router.get("/:slug", getProduct);

// --- Admin / Staff only ---
router.post(
  "/",
  authenticate,
  requireRole("super_admin", "admin"),
  createProductValidator,
  validate,
  postProduct
);

router.patch(
  "/:id",
  authenticate,
  requireRole("super_admin", "admin"),
  updateProductValidator,
  validate,
  patchProduct
);

router.delete(
  "/:id",
  authenticate,
  requireRole("super_admin", "admin"),
  productIdParamValidator,
  validate,
  removeProduct
);

export default router;