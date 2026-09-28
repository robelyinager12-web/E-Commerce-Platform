import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import {
  listSellerReviews,
  createSellerReview,
  deleteMySellerReview,
} from "../services/sellerReview.service";

export const getSellerReviews = asyncHandler(async (req: Request, res: Response) => {
  const { items, meta, summary } = await listSellerReviews(
    req.params.sellerId,
    req.query as Record<string, unknown>
  );
  sendSuccess(res, "Seller reviews retrieved", { items, meta, summary });
});

export const postSellerReview = asyncHandler(async (req: Request, res: Response) => {
  const { rating, comment } = req.body;
  const review = await createSellerReview(req.user!.userId, req.params.sellerId, {
    rating,
    comment,
  });
  sendSuccess(res, "Review submitted successfully", review, 201);
});

export const removeMySellerReview = asyncHandler(async (req: Request, res: Response) => {
  await deleteMySellerReview(req.user!.userId, req.params.sellerId);
  sendSuccess(res, "Review deleted successfully");
});