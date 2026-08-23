import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import {
  listProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../services/review.service";

export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const { items, meta } = await listProductReviews(
    req.params.productId,
    req.query as Record<string, unknown>
  );
  sendSuccess(res, "Reviews retrieved", { items, meta });
});

export const postProductReview = asyncHandler(async (req: Request, res: Response) => {
  const { rating, comment } = req.body;
  const review = await createReview(req.user!.userId, req.params.productId, { rating, comment });
  sendSuccess(res, "Review submitted successfully", review, 201);
});

export const patchReview = asyncHandler(async (req: Request, res: Response) => {
  const { rating, comment } = req.body;
  const review = await updateReview(req.user!.userId, req.params.id, { rating, comment });
  sendSuccess(res, "Review updated successfully", review);
});

export const removeReview = asyncHandler(async (req: Request, res: Response) => {
  await deleteReview(req.user!.userId, req.user!.role, req.params.id);
  sendSuccess(res, "Review deleted successfully");
});