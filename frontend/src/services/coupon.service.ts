import { api, ApiResponse } from "./api";
import { CouponValidationResult } from "../types/coupon.types";

export async function validateCoupon(
  code: string,
  orderSubtotal: number
): Promise<CouponValidationResult> {
  const response = await api.post<ApiResponse<CouponValidationResult>>("/coupons/validate", {
    code,
    orderSubtotal,
  });
  return response.data.data;
}