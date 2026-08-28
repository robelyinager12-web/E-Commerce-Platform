import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyOrders } from "../services/order.service";
import { OrderSummary, PaginationMeta } from "../types/order.types";
import { OrderStatusBadge } from "../components/common/OrderStatusBadge";
import { Pagination } from "../components/common/Pagination";
import { getErrorMessage } from "../utils/getErrorMessage";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function OrderHistory() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchMyOrders(page)
      .then(({ items, meta: newMeta }) => {
        if (cancelled) return;
        setOrders(items);
        setMeta(newMeta);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink">Your orders</h1>

      {isLoading && <p className="font-sans text-sm text-muted">Loading…</p>}
      {error && <p className="font-sans text-sm text-red-700">{error}</p>}

      {!isLoading && !error && orders.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-sans text-sm text-muted">You haven't placed any orders yet.</p>
          <Link to="/products" className="btn-primary mt-6 inline-flex">
            Browse products
          </Link>
        </div>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <>
          <div className="card divide-y divide-hairline">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-teal-light/40"
              >
                <div>
                  <p className="font-mono text-sm text-ink">{order.order_number}</p>
                  <p className="mt-0.5 font-sans text-xs text-muted">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="price-tag text-sm">${order.total_amount}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            ))}
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}