import { FormEvent, useState } from "react";
import { CouponAdmin, CouponInput } from "../../types/couponAdmin.types";
import { FormField } from "../common/FormField";

interface CouponFormValues {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  minOrderAmount: string;
  maxUses: string;
  validFrom: string;
  validUntil: string;
}

function toDateInputValue(iso?: string): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function toFormValues(coupon?: CouponAdmin): CouponFormValues {
  return {
    code: coupon?.code ?? "",
    discountType: coupon?.discount_type ?? "percentage",
    discountValue: coupon?.discount_value ?? "",
    minOrderAmount: coupon?.min_order_amount ?? "0",
    maxUses: coupon?.max_uses !== null && coupon?.max_uses !== undefined ? String(coupon.max_uses) : "",
    validFrom: toDateInputValue(coupon?.valid_from),
    validUntil: toDateInputValue(coupon?.valid_until),
  };
}

export function CouponForm({
  existing,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  existing?: CouponAdmin;
  onSubmit: (input: CouponInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<CouponFormValues>(toFormValues(existing));

  function updateField<K extends keyof CouponFormValues>(field: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues((prev) => ({ ...prev, [field]: e.target.value }) as CouponFormValues);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      code: values.code,
      discountType: values.discountType,
      discountValue: parseFloat(values.discountValue),
      minOrderAmount: values.minOrderAmount ? parseFloat(values.minOrderAmount) : undefined,
      maxUses: values.maxUses ? parseInt(values.maxUses, 10) : undefined,
      validFrom: new Date(values.validFrom).toISOString(),
      validUntil: new Date(values.validUntil).toISOString(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-sm border border-hairline p-5">
      <FormField
        id="code"
        label="Code"
        required
        value={values.code}
        onChange={updateField("code")}
        placeholder="e.g. SUMMER25"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="discountType" className="mb-1.5 block font-sans text-sm font-medium text-ink">
            Discount type
          </label>
          <select
            id="discountType"
            value={values.discountType}
            onChange={updateField("discountType")}
            className="input-field"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </select>
        </div>
        <FormField
          id="discountValue"
          label={values.discountType === "percentage" ? "Discount (%)" : "Discount ($)"}
          type="number"
          step="0.01"
          min="0"
          max={values.discountType === "percentage" ? "100" : undefined}
          required
          value={values.discountValue}
          onChange={updateField("discountValue")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="minOrderAmount"
          label="Minimum order ($)"
          type="number"
          step="0.01"
          min="0"
          value={values.minOrderAmount}
          onChange={updateField("minOrderAmount")}
        />
        <FormField
          id="maxUses"
          label="Max uses (optional)"
          type="number"
          min="1"
          value={values.maxUses}
          onChange={updateField("maxUses")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="validFrom"
          label="Valid from"
          type="date"
          required
          value={values.validFrom}
          onChange={updateField("validFrom")}
        />
        <FormField
          id="validUntil"
          label="Valid until"
          type="date"
          required
          value={values.validUntil}
          onChange={updateField("validUntil")}
        />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : existing ? "Save changes" : "Create coupon"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}