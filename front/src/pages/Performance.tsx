import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyListings } from "../services/listing.service";
import { resolveImageUrl } from "../services/api";
import { ListingListItem } from "../types/listing.types";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import { getMyAdvertsPath } from "../utils/profileRoutes";

function StatCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-lg border border-hairline bg-white p-5">
      <p className="font-sans text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value.toLocaleString()}</p>
      <p className="mt-1 font-sans text-xs text-muted">{detail}</p>
    </div>
  );
}

/** Seller statistics from the lifetime counters currently collected by the API. */
export function Performance() {
  const { t, localize } = useLanguage();
  const { user } = useAuth();
  const [listings, setListings] = useState<ListingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMyListings()
      .then((items) => {
        if (!cancelled) setListings(items);
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
  }, []);

  const stats = useMemo(
    () => ({
      total: listings.length,
      active: listings.filter((listing) => listing.status === "active").length,
      sold: listings.filter((listing) => listing.status === "sold").length,
      views: listings.reduce((sum, listing) => sum + (listing.views_count ?? 0), 0),
    }),
    [listings]
  );

  const topAds = useMemo(
    () =>
      [...listings]
        .sort((a, b) => (b.views_count ?? 0) - (a.views_count ?? 0))
        .slice(0, 10),
    [listings]
  );
  const highestViews = Math.max(1, ...topAds.map((listing) => listing.views_count ?? 0));
  const sideLink = "block rounded-md px-4 py-3 text-sm transition-colors";

  return (
    <div className="min-h-[70vh] bg-form-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 font-sans text-sm text-muted">
          <Link to="/profile/shop" className="hover:text-teal">
            {t("myShop")}
          </Link>
          <span className="mx-2">/</span>
          {t("performance")}
        </p>
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{t("performance")}</h1>
            <p className="mt-2 font-sans text-sm text-muted">
              {localize("Overview of your listings and the views they have received.")}
            </p>
          </div>
          <span className="rounded-full border border-hairline bg-white px-3 py-1.5 font-sans text-xs text-muted">
            {localize("Lifetime statistics")}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-[230px_minmax(0,1fr)]">
          <nav aria-label={localize("Seller account")} className="h-fit rounded-lg bg-white p-2 shadow-sm">
            <p className="px-4 pb-2 pt-3 font-mono text-[11px] uppercase tracking-widest text-muted">
              {localize("My account")}
            </p>
            <Link to="/profile/shop" className={`${sideLink} text-ink hover:bg-paper`}>
              {t("myShop")}
            </Link>
            {user && (
              <Link to="/profile/feedback" className={`${sideLink} text-ink hover:bg-paper`}>
                {t("feedback")}
              </Link>
            )}
            <Link
              to="/profile/statistics"
              aria-current="page"
              className={`${sideLink} bg-teal-light font-medium text-teal-dark`}
            >
              {t("performance")}
            </Link>
            <Link to="/profile/settings/contact-details" className={`${sideLink} text-ink hover:bg-paper`}>
              {t("settings")}
            </Link>
          </nav>

          <div className="min-w-0">
            {isLoading && <p className="rounded-lg bg-white p-5 font-sans text-sm text-muted">{localize("Loading statistics…")}</p>}
            {error && <p role="alert" className="rounded-lg bg-white p-5 font-sans text-sm text-red-700">{error}</p>}

            {!isLoading && !error && (
              <>
                <section aria-label={localize("Listing statistics")} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <StatCard label={localize("Total views")} value={stats.views} detail={localize("Across all your ads")} />
                  <StatCard label={localize("Active ads")} value={stats.active} detail={localize("Currently visible")} />
                  <StatCard label={localize("Sold ads")} value={stats.sold} detail={localize("Marked as sold")} />
                  <StatCard label={localize("All ads")} value={stats.total} detail={localize("Active and inactive")} />
                </section>

                <section className="mt-6 overflow-hidden rounded-lg border border-hairline bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4">
                    <div>
                      <h2 className="font-display text-lg font-semibold text-ink">{localize("Views by ad")}</h2>
                      <p className="mt-1 font-sans text-xs text-muted">{localize("Your top 10 listings by lifetime views")}</p>
                    </div>
                    <Link to={getMyAdvertsPath(user?.id)} className="font-sans text-sm font-medium text-teal-dark hover:underline">
                      {localize("Manage ads")}
                    </Link>
                  </div>

                  {topAds.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <p className="font-sans text-sm text-muted">{localize("You haven’t posted any ads yet.")}</p>
                      <Link to="/listings/new" className="btn-primary mt-4 inline-flex !py-2 !text-sm">
                        {localize("Post your first ad")}
                      </Link>
                    </div>
                  ) : (
                    <ul className="divide-y divide-hairline">
                      {topAds.map((listing) => {
                        const views = listing.views_count ?? 0;
                        const share = (views / highestViews) * 100;
                        return (
                          <li key={listing.id}>
                            <Link
                              to={`/listings/${listing.slug}`}
                              className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-paper sm:grid-cols-[64px_minmax(0,1fr)_100px]"
                            >
                              <div className="h-12 w-12 overflow-hidden rounded-md bg-teal-light sm:h-14 sm:w-14">
                                {listing.primary_image && (
                                  <img
                                    src={resolveImageUrl(listing.primary_image) ?? undefined}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-sans text-sm font-medium text-ink">{listing.title}</p>
                                <div
                                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper"
                                  role="img"
                                  aria-label={`${views.toLocaleString()} views`}
                                >
                                  <div
                                    className="h-full rounded-full bg-teal"
                                    style={{ width: `${share}%` }}
                                  />
                                </div>
                              </div>
                              <span className="whitespace-nowrap text-right font-sans text-sm text-muted">
                                {views.toLocaleString()} <span className="hidden sm:inline">{t("views")}</span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
