import { useEffect, useState, useCallback } from "react";
import {
  fetchCouponsAdmin,
  createCouponAdmin,
  updateCouponAdmin,
  deleteCouponAdmin,
} from "../../services/coupon.service";
import { CouponAdmin, CouponInput } from "../../types/couponAdmin.types";
import { CouponForm } from "../../components/admin/CouponForm";
import { getErrorMessage } from "../../utils/getErrorMessage";

type FormMode = { kind: "closed" } | { kind: "create" } | { kind: "edit"; coupon: CouponAdmin };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<CouponAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>({ kind: "closed" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const loadCoupons = useCallback(async () => {
    setCoupons(await fetchCouponsAdmin());
  }, []);

  useEffect(() => {
    loadCoupons()
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [loadCoupons]);

  async function handleCreate(input: CouponInput) {
    setError(null);
    setIsSubmitting(true);
    try {
      await createCouponAdmin(input);
      await loadCoupons();
      setFormMode({ kind: "closed" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(id: string, input: CouponInput) {
    setError(null);
    setIsSubmitting(true);
    try {
      await updateCouponAdmin(id, input);
      await loadCoupons();
      setFormMode({ kind: "closed" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(coupon: CouponAdmin) {
    setPendingId(coupon.id);
    setError(null);
    try {
      await updateCouponAdmin(coupon.id, { isActive: !coupon.is_active });
      await loadCoupons();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deactivate this coupon? It will no longer be usable at checkout.")) return;
    setPendingId(id);
    setError(null);
    try {
      await deleteCouponAdmin(id);
      await loadCoupons();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Coupons</h1>
        {formMode.kind === "closed" && (
          <button
            type="button"
            onClick={() => setFormMode({ kind: "create" })}
            className="btn-primary !py-2 !text-sm"
          >
            + New coupon
          </button>
        )}
      </div>

      {error && <p className="mb-4 font-sans text-sm text-red-700">{error}</p>}

      {formMode.kind === "create" && (
        <div className="mb-6">
          <CouponForm
            onSubmit={handleCreate}
            onCancel={() => setFormMode({ kind: "closed" })}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {formMode.kind === "edit" && (
        <div className="mb-6">
          <CouponForm
            existing={formMode.coupon}
            onSubmit={(input) => handleUpdate(formMode.coupon.id, input)}
            onCancel={() => setFormMode({ kind: "closed" })}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {isLoading ? (
        <p className="font-sans text-sm text-muted">Loading…</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full font-sans text-sm">
            <thead className="bg-white text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Min order</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Valid</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="price-tag px-4 py-3">{coupon.code}</td>
                  <td className="px-4 py-3 text-ink/80">
                    {coupon.discount_type === "percentage"
                      ? `${coupon.discount_value}%`
                      : `$${coupon.discount_value}`}
                  </td>
                  <td className="px-4 py-3 text-ink/80">${coupon.min_order_amount}</td>
                  <td className="px-4 py-3 text-ink/80">
                    {coupon.times_used}
                    {coupon.max_uses ? ` / ${coupon.max_uses}` : ""}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {formatDate(coupon.valid_from)} – {formatDate(coupon.valid_until)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(coupon)}
                      disabled={pendingId === coupon.id}
                      className={`rounded-sm px-2 py-1 font-mono text-xs uppercase ${
                        coupon.is_active ? "bg-teal-light text-teal-dark" : "bg-hairline text-ink/60"
                      }`}
                    >
                      {coupon.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setFormMode({ kind: "edit", coupon })}
                      className="mr-3 text-teal hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(coupon.id)}
                      disabled={pendingId === coupon.id || !coupon.is_active}
                      className="text-muted hover:text-red-700 disabled:opacity-40"
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}