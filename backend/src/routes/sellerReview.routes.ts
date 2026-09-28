import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  sellerIdParamValidator,
  listSellerReviewsValidator,
  createSellerReviewValidator,
} from "../validators/sellerReview.validator";
import {
  getSellerReviews,
  postSellerReview,
  removeMySellerReview,
} from "../controllers/sellerReview.controller";

const router = Router();

// Public: read a seller's reviews and rating summary
router.get("/:sellerId/reviews", listSellerReviewsValidator, validate, getSellerReviews);

// Authenticated: leave, or remove your own, review of a seller
router.post(
  "/:sellerId/reviews",
  authenticate,
  createSellerReviewValidator,
  validate,
  postSellerReview
);
router.delete(
  "/:sellerId/reviews",
  authenticate,
  sellerIdParamValidator,
  validate,
  removeMySellerReview
);

export default router;