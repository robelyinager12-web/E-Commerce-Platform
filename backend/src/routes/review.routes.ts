import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createReviewValidator,
  updateReviewValidator,
  reviewIdParamValidator,
  listReviewsValidator,
} from "../validators/review.validator";
import {
  getProductReviews,
  postProductReview,
  patchReview,
  removeReview,
} from "../controllers/review.controller";

const router = Router();

// --- Public: list reviews for a product ---
router.get("/products/:productId", listReviewsValidator, validate, getProductReviews);

// --- Authenticated: submit a review for a product ---
router.post(
  "/products/:productId",
  authenticate,
  createReviewValidator,
  validate,
  postProductReview
);

// --- Authenticated: edit or delete your own review (admins can also delete) ---
router.patch("/:id", authenticate, updateReviewValidator, validate, patchReview);
router.delete("/:id", authenticate, reviewIdParamValidator, validate, removeReview);

export default router;