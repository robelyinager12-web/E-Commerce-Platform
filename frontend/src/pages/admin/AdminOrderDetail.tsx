import { FormEvent, useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchOrderByIdAdmin, updateOrderStatusAdmin } from "../../services/order.service";
import { OrderDetail } from "../../types/order.types";
import { OrderStatusBadge } from "../../components/common/OrderStatusBadge";
import { getErrorMessage } from "../../utils/getErrorMessage";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextStatus, setNextStatus] = useState("");
  const [note, setNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    const data = await fetchOrderByIdAdmin(id);
    setOrder(data);
    setNextStatus("");
    setNote("");
  }, [id]);

  useEffect(() => {
    loadOrder()
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [loadOrder]);

  async function handleStatusUpdate(e: FormEvent) {
    e.preventDefault();
    if (!id || !nextStatus) return;
    setIsUpdating(true);
    setError(null);
    try {
      await updateOrderStatusAdmin(id, nextStatus, note || undefined);
      await loadOrder();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return <p className="font-sans text-sm text-muted">Loading…</p>;
  }

  if (error && !order) {
    return (
      <div>
        <p className="font-sans text-sm text-red-700">{error}</p>
        <Link to="/admin/orders" className="btn-secondary mt-4 inline-flex">
          Back to orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const nextOptions = VALID_TRANSITIONS[order.status] ?? [];

  return (
    <div>
      <Link to="/admin/orders" className="mb-6 inline-block font-sans text-sm text-muted hover:text-ink">
        ← Back to orders
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-sm text-ink">{order.order_number}</p>
          <p className="mt-1 font-sans text-sm text-muted">Placed {formatDate(order.created_at)}</p>
          <p className="mt-1 font-sans text-sm text-ink/80">
            {order.customer_name ?? "Guest"}
            {order.customer_email ? ` · ${order.customer_email}` : ""}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {error && <p className="mt-4 font-sans text-sm text-red-700">{error}</p>}

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Items</h2>
          <div className="card divide-y divide-hairline">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between px-4 py-3 font-sans text-sm">
                <span className="text-ink/80">
                  {item.product_name_snapshot} × {item.quantity}
                </span>
                <span className="price-tag">${item.subtotal}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-1.5 font-sans text-sm text-ink/80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="price-tag">${order.subtotal}</span>
            </div>
            {parseFloat(order.discount_amount) > 0 && (
              <div className="flex justify-between text-teal-dark">
                <span>Discount</span>
                <span className="price-tag">−${order.discount_amount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="price-tag">
                {parseFloat(order.shipping_cost) === 0 ? "Free" : `$${order.shipping_cost}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span className="price-tag">${order.tax_amount}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-hairline pt-2 font-medium text-ink">
              <span>Total</span>
              <span className="price-tag text-base">${order.total_amount}</span>
            </div>
          </div>

          <h2 className="mb-3 mt-8 font-display text-lg font-semibold text-ink">Shipping to</h2>
          <div className="card p-4 font-sans text-sm text-ink/80">
            <p>{order.shipping_address.street}</p>
            <p>
              {order.shipping_address.city}
              {order.shipping_address.state ? `, ${order.shipping_address.state}` : ""}{" "}
              {order.shipping_address.postalCode}
            </p>
            <p>{order.shipping_address.country}</p>
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Update status</h2>
          {nextOptions.length > 0 ? (
            <form onSubmit={handleStatusUpdate} className="card flex flex-col gap-3 p-4">
              <select
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value)}
                className="input-field"
                required
              >
                <option value="" disabled>
                  Move to…
                </option>
                {nextOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
                rows={2}
                className="input-field"
              />
              <button type="submit" className="btn-primary self-start" disabled={isUpdating || !nextStatus}>
                {isUpdating ? "Updating…" : "Update status"}
              </button>
            </form>
          ) : (
            <p className="card p-4 font-sans text-sm text-muted">
              This order has reached a final status and can't be moved further.
            </p>
          )}

          <h2 className="mb-3 mt-8 font-display text-lg font-semibold text-ink">Status history</h2>
          <div className="card divide-y divide-hairline">
            {order.status_history.map((entry, index) => (
              <div key={index} className="flex items-center justify-between px-4 py-3">
                <div>
                  <OrderStatusBadge status={entry.status} />
                  {entry.note && <p className="mt-1 font-sans text-xs text-muted">{entry.note}</p>}
                </div>
                <p className="font-mono text-xs text-muted">{formatDate(entry.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}