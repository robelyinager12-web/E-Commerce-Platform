import { query } from "../config/database";
import { ApiError } from "../utils/apiError.util";

export interface CouponRow {
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

export async function listCoupons(): Promise<CouponRow[]> {
  const result = await query<CouponRow>(
    `SELECT id, code, discount_type, discount_value::text, min_order_amount::text,
            max_uses, times_used, valid_from, valid_until, is_active
     FROM coupons ORDER BY valid_from DESC`
  );
  return result.rows;
}

export async function getCouponById(id: string): Promise<CouponRow> {
  const result = await query<CouponRow>(
    `SELECT id, code, discount_type, discount_value::text, min_order_amount::text,
            max_uses, times_used, valid_from, valid_until, is_active
     FROM coupons WHERE id = $1`,
    [id]
  );
  const coupon = result.rows[0];
  if (!coupon) {
    throw ApiError.notFound("Coupon not found");
  }
  return coupon;
}

export async function createCoupon(input: {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  validFrom: string;
  validUntil: string;
}): Promise<CouponRow> {
  const existing = await query("SELECT id FROM coupons WHERE code = $1", [input.code]);
  if (existing.rows.length > 0) {
    throw ApiError.conflict("A coupon with this code already exists");
  }

  const result = await query<CouponRow>(
    `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, valid_from, valid_until, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true)
     RETURNING id, code, discount_type, discount_value::text, min_order_amount::text,
               max_uses, times_used, valid_from, valid_until, is_active`,
    [
      input.code,
      input.discountType,
      input.discountValue,
      input.minOrderAmount ?? 0,
      input.maxUses ?? null,
      input.validFrom,
      input.validUntil,
    ]
  );
  return result.rows[0];
}

export async function updateCoupon(
  id: string,
  input: {
    discountType?: "percentage" | "fixed";
    discountValue?: number;
    minOrderAmount?: number;
    maxUses?: number;
    validFrom?: string;
    validUntil?: string;
    isActive?: boolean;
  }
): Promise<CouponRow> {
  await getCouponById(id); // 404s if missing

  const result = await query<CouponRow>(
    `UPDATE coupons SET
       discount_type = COALESCE($1, discount_type),
       discount_value = COALESCE($2, discount_value),
       min_order_amount = COALESCE($3, min_order_amount),
       max_uses = COALESCE($4, max_uses),
       valid_from = COALESCE($5, valid_from),
       valid_until = COALESCE($6, valid_until),
       is_active = COALESCE($7, is_active)
     WHERE id = $8
     RETURNING id, code, discount_type, discount_value::text, min_order_amount::text,
               max_uses, times_used, valid_from, valid_until, is_active`,
    [
      input.discountType,
      input.discountValue,
      input.minOrderAmount,
      input.maxUses,
      input.validFrom,
      input.validUntil,
      input.isActive,
      id,
    ]
  );
  return result.rows[0];
}

export async function deleteCoupon(id: string): Promise<void> {
  await getCouponById(id); // 404s if missing
  // Soft delete: deactivate rather than hard-delete, since past orders
  // may reference this coupon via order_coupons and its usage history
  // (times_used) is meaningful reporting data worth preserving.
  await query("UPDATE coupons SET is_active = false WHERE id = $1", [id]);
}

export interface CouponValidationResult {
  valid: boolean;
  reason?: string;
  discountAmount?: string;
  coupon?: { code: string; discountType: string; discountValue: string };
}

/**
 * Dry-run validation used by the cart/checkout UI to preview a discount
 * before actually placing the order. Does NOT increment times_used or
 * reserve anything — the real, authoritative check happens again inside
 * the checkout transaction in order.service.ts.
 */
export async function validateCouponForPreview(
  code: string,
  orderSubtotal: number
): Promise<CouponValidationResult> {
  const result = await query<CouponRow>("SELECT * FROM coupons WHERE code = $1", [
    code.toUpperCase(),
  ]);
  const coupon = result.rows[0];

  if (!coupon || !coupon.is_active) {
    return { valid: false, reason: "Invalid or inactive coupon code" };
  }

  const now = new Date();
  if (now < new Date(coupon.valid_from) || now > new Date(coupon.valid_until)) {
    return { valid: false, reason: "This coupon has expired or is not yet valid" };
  }

  if (coupon.max_uses !== null && coupon.times_used >= coupon.max_uses) {
    return { valid: false, reason: "This coupon has reached its usage limit" };
  }

  if (orderSubtotal < parseFloat(coupon.min_order_amount)) {
    return {
      valid: false,
      reason: `This coupon requires a minimum order of $${coupon.min_order_amount}`,
    };
  }

  const discountAmount =
    coupon.discount_type === "percentage"
      ? orderSubtotal * (parseFloat(coupon.discount_value) / 100)
      : parseFloat(coupon.discount_value);

  return {
    valid: true,
    discountAmount: Math.min(discountAmount, orderSubtotal).toFixed(2),
    coupon: {
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
    },
  };
}