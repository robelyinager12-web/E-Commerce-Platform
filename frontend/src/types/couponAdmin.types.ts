export interface CouponAdmin {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  min_order_amount: string;
  max_uses: number | null;
  times_used: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

export interface CouponInput {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  validFrom: string;
  validUntil: string;
}