export interface CouponValidationResult {
  valid: boolean;
  reason?: string;
  discountAmount?: string;
  coupon?: { code: string; discountType: "percentage" | "fixed"; discountValue: string };
}