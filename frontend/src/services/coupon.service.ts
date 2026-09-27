import { api } from "./api";
import { CouponValidationResult } from "../types/coupon.types";
import { CouponAdmin, CouponInput } from "../types/couponAdmin.types";

export async function validateCoupon(
  code: string,
  orderSubtotal: number
): Promise<CouponValidationResult> {
  const response = await api.post("/coupons/validate", { code, orderSubtotal });
  return response.data.data as CouponValidationResult;
}

// --- Admin ---

export async function fetchCouponsAdmin(): Promise<CouponAdmin[]> {
  const response = await api.get("/coupons");
  return response.data.data as CouponAdmin[];
}

export async function createCouponAdmin(input: CouponInput): Promise<CouponAdmin> {
  const response = await api.post("/coupons", input);
  return response.data.data as CouponAdmin;
}

export async function updateCouponAdmin(
  id: string,
  input: Partial<CouponInput> & { isActive?: boolean }
): Promise<CouponAdmin> {
  const response = await api.patch(`/coupons/${id}`, input);
  return response.data.data as CouponAdmin;
}

export async function deleteCouponAdmin(id: string): Promise<void> {
  await api.delete(`/coupons/${id}`);
}