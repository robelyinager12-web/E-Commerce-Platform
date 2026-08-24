import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import {
  getOverview,
  getSalesOverTime,
  getTopProducts,
  getLowStockProducts,
  getOrderStatusBreakdown,
} from "../services/analytics.service";

function rangeFromQuery(req: Request) {
  return {
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
  };
}

export const getOverviewStats = asyncHandler(async (req: Request, res: Response) => {
  const overview = await getOverview(rangeFromQuery(req));
  sendSuccess(res, "Analytics overview retrieved", overview);
});

export const getSalesOverTimeStats = asyncHandler(async (req: Request, res: Response) => {
  const interval = (req.query.interval as "day" | "week" | "month") ?? "day";
  const points = await getSalesOverTime(rangeFromQuery(req), interval);
  sendSuccess(res, "Sales over time retrieved", points);
});

export const getTopProductsStats = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const products = await getTopProducts(rangeFromQuery(req), limit);
  sendSuccess(res, "Top products retrieved", products);
});

export const getLowStockStats = asyncHandler(async (req: Request, res: Response) => {
  const threshold = req.query.threshold ? parseInt(req.query.threshold as string, 10) : undefined;
  const products = await getLowStockProducts(threshold);
  sendSuccess(res, "Low stock products retrieved", products);
});

export const getOrderStatusStats = asyncHandler(async (req: Request, res: Response) => {
  const breakdown = await getOrderStatusBreakdown(rangeFromQuery(req));
  sendSuccess(res, "Order status breakdown retrieved", breakdown);
});