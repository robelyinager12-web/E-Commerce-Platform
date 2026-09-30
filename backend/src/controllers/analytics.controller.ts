import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import { getOverview, getListingsByCategory, getTopSellers } from "../services/analytics.service";

export const getOverviewStats = asyncHandler(async (_req: Request, res: Response) => {
  const overview = await getOverview();
  sendSuccess(res, "Analytics overview retrieved", overview);
});

export const getCategoryBreakdown = asyncHandler(async (_req: Request, res: Response) => {
  const breakdown = await getListingsByCategory();
  sendSuccess(res, "Category breakdown retrieved", breakdown);
});

export const getTopSellersStats = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const sellers = await getTopSellers(limit);
  sendSuccess(res, "Top sellers retrieved", sellers);
});