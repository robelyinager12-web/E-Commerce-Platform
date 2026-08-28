import { useEffect, useState, useCallback } from "react";
import { fetchAllOrdersAdmin, updateOrderStatusAdmin } from "../../services/order.service";
import { OrderSummary, PaginationMeta } from "../../types/order.types";
import { OrderStatusBadge } from "../../components/common/OrderStatusBadge";
import { Pagination } from "../../components/common/Pagination";
import { getErrorMessage } from "../../utils/getErrorMessage";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

// Mirrors the backend's status state machine (order.service.ts, Step 7) so
// the dropdown only ever offers transitions that will actually succeed.
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function AdminOrders() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    const { items, meta: newMeta } = await fetchAllOrdersAdmin(page, statusFilter || undefined);
    setOrders(items);
    setMeta(newMeta);
  }, [page, statusFilter]);

  useEffect(() => {
    setIsLoading(true);
    loadOrders()
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [loadOrders]);

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    setError(null);
    try {
      await updateOrderStatusAdmin(orderId, newStatus);
      await loadOrders();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input-field w-48 !py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mb-4 font-sans text-sm text-red-700">{error}</p>}

      {isLoading ? (
        <p className="font-sans text-sm text-muted">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="font-sans text-sm text-muted">No orders match this filter.</p>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full font-sans text-sm">
              <thead className="bg-white text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {orders.map((order) => {
                  const nextOptions = VALID_TRANSITIONS[order.status] ?? [];
                  return (
                    <tr key={order.id}>
                      <td className="px-4 py-3 font-mono text-xs text-ink">{order.order_number}</td>
                      <td className="px-4 py-3 text-muted">{formatDate(order.created_at)}</td>
                      <td className="price-tag px-4 py-3">${order.total_amount}</td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        {nextOptions.length > 0 ? (
                          <select
                            defaultValue=""
                            disabled={updatingId === order.id}
                            onChange={(e) => {
                              if (e.target.value) handleStatusChange(order.id, e.target.value);
                            }}
                            className="input-field !py-1.5 text-xs"
                          >
                            <option value="" disabled>
                              {updatingId === order.id ? "Updating…" : "Move to…"}
                            </option>
                            {nextOptions.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-sans text-xs text-muted">Final</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}