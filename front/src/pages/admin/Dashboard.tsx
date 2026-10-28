import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOverview, fetchCategoryBreakdown, fetchTopSellers } from "../../services/analytics.service";
import { OverviewStats, CategoryBreakdown, TopSeller } from "../../types/analytics.types";
import { StatCard } from "../../components/admin/StatCard";
import { getErrorMessage } from "../../utils/getErrorMessage";

export function Dashboard() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchOverview(), fetchCategoryBreakdown(), fetchTopSellers(5)])
      .then(([o, c, s]) => {
        setOverview(o);
        setCategories(c);
        setTopSellers(s);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p className="font-sans text-sm text-muted">Loading dashboard…</p>;
  if (error || !overview) return <p className="font-sans text-sm text-red-700">{error ?? "Failed to load."}</p>;

  const maxCategoryCount = Math.max(1, ...categories.map((c) => c.listingCount));

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Active listings" value={String(overview.activeListings)} />
        <StatCard label="All-time listings" value={String(overview.totalListingsAllTime)} />
        <StatCard label="Users" value={String(overview.totalUsers)} sub={`+${overview.newUsers30d} in 30d`} />
        <StatCard label="Pending reports" value={String(overview.pendingReports)} />
        <Link to="/admin/reports" className="card flex items-center justify-center p-5 font-sans text-sm text-teal hover:underline">
          Review reports →
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-ink">Listings by category</h2>
          <div className="flex flex-col gap-2">
            {categories.map((c) => (
              <div key={c.categorySlug} className="flex items-center gap-3">
                <span className="w-32 shrink-0 font-sans text-xs text-ink/70">{c.categoryName}</span>
                <div className="h-2 flex-1 rounded-full bg-hairline">
                  <div
                    className="h-2 rounded-full bg-teal"
                    style={{ width: `${(c.listingCount / maxCategoryCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-xs text-muted">{c.listingCount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-ink">Top sellers</h2>
          <div className="flex flex-col divide-y divide-hairline">
            {topSellers.map((s) => (
              <Link
                key={s.sellerId}
                to={`/sellers/${s.sellerId}`}
                className="flex items-center justify-between py-2.5 hover:text-teal"
              >
                <span className="font-sans text-sm text-ink/80">{s.sellerName}</span>
                <span className="flex items-center gap-3 font-mono text-xs text-muted">
                  <span>{s.activeListings} listings</span>
                  <span>★ {s.averageRating}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}