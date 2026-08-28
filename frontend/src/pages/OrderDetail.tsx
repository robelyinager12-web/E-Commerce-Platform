import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { fetchMyOrderById } from "../services/order.service";
import { OrderDetail as OrderDetailType } from "../types/order.types";
import { OrderStatusBadge } from "../components/common/OrderStatusBadge";
import { getErrorMessage } from "../utils/getErrorMessage";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const justPlaced = Boolean((location.state as { justPlaced?: boolean } | null)?.justPlaced);

  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchMyOrderById(id)
      .then(setOrder)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-6 py-16 font-sans text-sm text-muted">Loading…</div>;
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="font-sans text-sm text-red-700">{error ?? "Order not found."}</p>
        <Link to="/orders" className="btn-secondary mt-4 inline-flex">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {justPlaced && (
        <div className="mb-8 rounded-sm border border-teal-light bg-teal-light px-6 py-5">
          <p className="font-display text-xl font-semibold text-teal-dark">Thank you for your order!</p>
          <p className="mt-1 font-sans text-sm text-teal-dark/80">
            A confirmation has been placed for order {order.order_number}.
          </p>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-sm text-muted">Order {order.order_number}</p>
          <p className="mt-1 font-sans text-sm text-muted">Placed {formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2">
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
        </div>

        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Shipping to</h2>
          <div className="card p-4 font-sans text-sm text-ink/80">
            <p>{order.shipping_address.street}</p>
            <p>
              {order.shipping_address.city}
              {order.shipping_address.state ? `, ${order.shipping_address.state}` : ""}{" "}
              {order.shipping_address.postalCode}
            </p>
            <p>{order.shipping_address.country}</p>
          </div>

          <h2 className="mb-3 mt-6 font-display text-lg font-semibold text-ink">Order status</h2>
          <div className="card divide-y divide-hairline">
            {order.status_history.map((entry, index) => (
              <div key={index} className="flex items-center justify-between px-4 py-3">
                <div>
                  <OrderStatusBadge status={entry.status} />
                  {entry.note && (
                    <p className="mt-1 font-sans text-xs text-muted">{entry.note}</p>
                  )}
                </div>
                <p className="font-mono text-xs text-muted">{formatDate(entry.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Link to="/orders" className="btn-secondary mt-10 inline-flex">
        Back to orders
      </Link>
    </div>
  );
}