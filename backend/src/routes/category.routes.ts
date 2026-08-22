import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdParamValidator,
} from "../validators/category.validator";
import {
  getCategories,
  getCategory,
  postCategory,
  patchCategory,
  removeCategory,
} from "../controllers/category.controller";

const router = Router();

// --- Public ---
router.get("/", getCategories);
router.get("/:slug", getCategory);

// --- Admin / Staff only ---
router.post(
  "/",
  authenticate,
  requireRole("super_admin", "admin"),
  createCategoryValidator,
  validate,
  postCategory
);

router.patch(
  "/:id",
  authenticate,
  requireRole("super_admin", "admin"),
  updateCategoryValidator,
  validate,
  patchCategory
);

router.delete(
  "/:id",
  authenticate,
  requireRole("super_admin", "admin"),
  categoryIdParamValidator,
  validate,
  removeCategory
);

export default router;