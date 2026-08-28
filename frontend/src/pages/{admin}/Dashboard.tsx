import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchOverview,
  fetchSalesOverTime,
  fetchTopProducts,
  fetchLowStock,
  fetchOrderStatusBreakdown,
} from "../../services/analytics.service";
import {
  OverviewStats,
  SalesOverTimePoint,
  TopProduct,
  LowStockProduct,
  OrderStatusCount,
} from "../../types/analytics.types";
import { StatCard } from "../../components/admin/StatCard";
import { OrderStatusBadge } from "../../components/common/OrderStatusBadge";
import { getErrorMessage } from "../../utils/getErrorMessage";

export function Dashboard() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [salesOverTime, setSalesOverTime] = useState<SalesOverTimePoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<OrderStatusCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchOverview(),
      fetchSalesOverTime("day"),
      fetchTopProducts(5),
      fetchLowStock(),
      fetchOrderStatusBreakdown(),
    ])
      .then(([o, s, t, l, b]) => {
        setOverview(o);
        setSalesOverTime(s);
        setTopProducts(t);
        setLowStock(l);
        setStatusBreakdown(b);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <p className="font-sans text-sm text-muted">Loading dashboard…</p>;
  }

  if (error || !overview) {
    return <p className="font-sans text-sm text-red-700">{error ?? "Failed to load dashboard."}</p>;
  }

  const maxRevenue = Math.max(1, ...salesOverTime.map((p) => parseFloat(p.revenue)));

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Revenue (30d)" value={`$${overview.totalRevenue}`} />
        <StatCard
          label="Orders (30d)"
          value={String(overview.totalOrders)}
          sub={`${overview.revenueOrders} paid`}
        />
        <StatCard label="Avg order value" value={`$${overview.averageOrderValue}`} />
        <StatCard
          label="Customers"
          value={String(overview.totalCustomers)}
          sub={`+${overview.newCustomers} new`}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="card p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-ink">Sales, last 30 days</h2>
          {salesOverTime.length === 0 ? (
            <p className="font-sans text-sm text-muted">No sales in this period.</p>
          ) : (
            <div className="flex h-40 items-end gap-1">
              {salesOverTime.map((point) => (
                <div
                  key={point.period}
                  className="flex-1 rounded-t-sm bg-teal"
                  style={{ height: `${(parseFloat(point.revenue) / maxRevenue) * 100}%` }}
                  title={`${point.period}: $${point.revenue} (${point.orderCount} orders)`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-ink">Order status</h2>
          <div className="flex flex-col gap-2">
            {statusBreakdown.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <OrderStatusBadge status={s.status} />
                <span className="price-tag text-sm">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-ink">Top products</h2>
          {topProducts.length === 0 ? (
            <p className="font-sans text-sm text-muted">No sales data yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-hairline">
              {topProducts.map((p) => (
                <Link
                  key={p.productId}
                  to={`/products/${p.slug}`}
                  className="flex items-center justify-between py-2.5 hover:text-teal"
                >
                  <span className="font-sans text-sm text-ink/80">{p.name}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted">{p.unitsSold} sold</span>
                    <span className="price-tag text-sm">${p.revenue}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-ink">Low stock</h2>
          {lowStock.length === 0 ? (
            <p className="font-sans text-sm text-muted">Nothing running low.</p>
          ) : (
            <div className="flex flex-col divide-y divide-hairline">
              {lowStock.map((p) => (
                <Link
                  key={p.id}
                  to="/admin/products"
                  className="flex items-center justify-between py-2.5 hover:text-teal"
                >
                  <span className="font-sans text-sm text-ink/80">{p.name}</span>
                  <span className="font-mono text-xs text-gold-dark">
                    {p.stockQuantity} left
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}