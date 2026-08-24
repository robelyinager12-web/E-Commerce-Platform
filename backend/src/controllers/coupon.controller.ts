import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import {
  listCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCouponForPreview,
} from "../services/coupon.service";

// --- Admin ---

export const getCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await listCoupons();
  sendSuccess(res, "Coupons retrieved", coupons);
});

export const getCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await getCouponById(req.params.id);
  sendSuccess(res, "Coupon retrieved", coupon);
});

export const postCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, discountType, discountValue, minOrderAmount, maxUses, validFrom, validUntil } =
    req.body;
  const coupon = await createCoupon({
    code,
    discountType,
    discountValue,
    minOrderAmount,
    maxUses,
    validFrom,
    validUntil,
  });
  sendSuccess(res, "Coupon created successfully", coupon, 201);
});

export const patchCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { discountType, discountValue, minOrderAmount, maxUses, validFrom, validUntil, isActive } =
    req.body;
  const coupon = await updateCoupon(req.params.id, {
    discountType,
    discountValue,
    minOrderAmount,
    maxUses,
    validFrom,
    validUntil,
    isActive,
  });
  sendSuccess(res, "Coupon updated successfully", coupon);
});

export const removeCoupon = asyncHandler(async (req: Request, res: Response) => {
  await deleteCoupon(req.params.id);
  sendSuccess(res, "Coupon deactivated successfully");
});

// --- Public (dry-run preview, used by cart page) ---

export const postValidateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, orderSubtotal } = req.body;
  const result = await validateCouponForPreview(code, orderSubtotal);
  sendSuccess(res, result.valid ? "Coupon is valid" : "Coupon is not valid", result);
});