import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import { listWishlist, addToWishlist, removeFromWishlist } from "../services/wishlist.service";

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const items = await listWishlist(req.user!.userId);
  sendSuccess(res, "Wishlist retrieved", items);
});

export const postWishlistItem = asyncHandler(async (req: Request, res: Response) => {
  const items = await addToWishlist(req.user!.userId, req.body.productId);
  sendSuccess(res, "Product added to wishlist", items, 201);
});

export const deleteWishlistItem = asyncHandler(async (req: Request, res: Response) => {
  const items = await removeFromWishlist(req.user!.userId, req.params.productId);
  sendSuccess(res, "Product removed from wishlist", items);
});