import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyListings } from "../services/listing.service";
import { ListingListItem } from "../types/listing.types";
import { useLanguage } from "../context/LanguageContext";
import { getErrorMessage } from "../utils/getErrorMessage";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="font-sans text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value.toLocaleString()}</p>
    </div>
  );
}

/** Seller performance: how many ads you have and how often they were viewed. */
export function Performance() {
  const { t } = useLanguage();
  const [listings, setListings] = useState<ListingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyListings()
      .then(setListings)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  const stats = useMemo(
    () => ({
      total: listings.length,
      active: listings.filter((l) => l.status === "active").length,
      sold: listings.filter((l) => l.status === "sold").length,
      views: listings.reduce((sum, l) => sum + (l.views_count ?? 0), 0),
    }),
    [listings]
  );

  const topAds = useMemo(
    () => [...listings].sort((a, b) => (b.views_count ?? 0) - (a.views_count ?? 0)).slice(0, 10),
    [listings]
  );

  return (
    <div className="bg-form-bg px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 font-display text-2xl font-semibold text-ink">{t("performance")}</h1>

        {isLoading && <p className="font-sans text-sm text-muted">Loading…</p>}
        {error && <p className="font-sans text-sm text-red-700">{error}</p>}

        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard label="Total ads" value={stats.total} />
              <StatCard label="Active ads" value={stats.active} />
              <StatCard label="Sold" value={stats.sold} />
              <StatCard label="Total views" value={stats.views} />
            </div>

            <h2 className="mb-3 mt-8 font-display text-lg font-semibold text-ink">
              Your most viewed ads
            </h2>

            {topAds.length === 0 ? (
              <p className="rounded-xl bg-white p-5 font-sans text-sm text-muted">
                You haven't posted anything yet.{" "}
                <Link to="/listings/new" className="font-medium text-teal-dark hover:underline">
                  Post your first ad
                </Link>
              </p>
            ) : (
              <ul className="divide-y divide-hairline overflow-hidden rounded-xl bg-white shadow-sm">
                {topAds.map((listing) => (
                  <li key={listing.id}>
                    <Link
                      to={`/listings/${listing.slug}`}
                      className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-paper"
                    >
                      <span className="min-w-0 truncate font-sans text-sm font-medium text-ink">
                        {listing.title}
                      </span>
                      <span className="shrink-0 font-sans text-sm text-muted">
                        {(listing.views_count ?? 0).toLocaleString()} views
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}