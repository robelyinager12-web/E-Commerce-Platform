import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { fetchMyListings, removeListing, updateListing } from "../services/listing.service";
import { resolveImageUrl } from "../services/api";
import { ListingListItem } from "../types/listing.types";
import { getErrorMessage } from "../utils/getErrorMessage";
import { getMyAdvertsPath } from "../utils/profileRoutes";

type AdFilter = "all" | "active" | "sold" | "inactive";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  sold: "bg-amber-50 text-amber-700",
  expired: "bg-slate-100 text-slate-600",
  removed: "bg-rose-50 text-rose-700",
};

function formatListingDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MyListings() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [listings, setListings] = useState<ListingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<AdFilter>("all");
  const [search, setSearch] = useState("");

  async function loadListings() {
    setError(null);
    try {
      setListings(await fetchMyListings());
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadListings();
  }, []);

  const counts = useMemo(
    () => ({
      all: listings.length,
      active: listings.filter((listing) => listing.status === "active").length,
      sold: listings.filter((listing) => listing.status === "sold").length,
      inactive: listings.filter((listing) => listing.status === "expired" || listing.status === "removed").length,
    }),
    [listings]
  );

  const filteredListings = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return listings.filter((listing) => {
      const matchesFilter =
        filter === "all" ||
        listing.status === filter ||
        (filter === "inactive" && (listing.status === "expired" || listing.status === "removed"));
      const matchesQuery =
        !query ||
        listing.title.toLocaleLowerCase().includes(query) ||
        listing.city.toLocaleLowerCase().includes(query) ||
        listing.region.toLocaleLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });
  }, [filter, listings, search]);

  async function handleMarkSold(id: string) {
    setPendingId(id);
    setError(null);
    try {
      await updateListing(id, { status: "sold" });
      await loadListings();
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setPendingId(null);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm(t("confirmRemoveAd"))) return;
    setPendingId(id);
    setError(null);
    try {
      await removeListing(id);
      await loadListings();
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setPendingId(null);
    }
  }

  const sideLink = "block rounded-md px-4 py-3 text-sm transition-colors";
  const tabs: { value: AdFilter; label: string }[] = [
    { value: "all", label: t("allAdverts") },
    { value: "active", label: t("active") },
    { value: "sold", label: t("sold") },
    { value: "inactive", label: t("inactive") },
  ];

  return (
    <div className="min-h-[70vh] bg-form-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 font-sans text-sm text-muted">
          <Link to="/profile/shop" className="hover:text-teal">{t("myShop")}</Link>
          <span className="mx-2">/</span>
          {t("myListings")}
        </p>

        <div className="grid gap-6 md:grid-cols-[230px_minmax(0,1fr)]">
          <nav aria-label={t("account")} className="h-fit rounded-lg bg-white p-2 shadow-sm">
            <p className="px-4 pb-2 pt-3 font-mono text-[11px] uppercase tracking-widest text-muted">
              {t("account")}
            </p>
            <Link to="/profile/shop" className={`${sideLink} text-ink hover:bg-paper`}>
              {t("myShop")}
            </Link>
            <Link
              to={getMyAdvertsPath(user?.id)}
              aria-current="page"
              className={`${sideLink} bg-teal-light font-medium text-teal-dark`}
            >
              {t("myListings")}
            </Link>
            <Link to="/profile/feedback" className={`${sideLink} text-ink hover:bg-paper`}>
              {t("feedback")}
            </Link>
            <Link to="/profile/statistics" className={`${sideLink} text-ink hover:bg-paper`}>
              {t("performance")}
            </Link>
            <Link to="/profile/settings/contact-details" className={`${sideLink} text-ink hover:bg-paper`}>
              {t("settings")}
            </Link>
          </nav>

          <main className="min-w-0">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{t("myListings")}</h1>
                <p className="mt-1 font-sans text-sm text-muted">{t("manageYourAdverts")}</p>
              </div>
              <Link to="/listings/new" className="btn-primary !py-2.5 !text-sm">
                + {t("postAd")}
              </Link>
            </div>

            {error && (
              <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-700">
                {error}
              </p>
            )}

            <section className="overflow-hidden rounded-lg border border-hairline bg-white shadow-sm">
              <div className="overflow-x-auto border-b border-hairline">
                <div className="flex min-w-max gap-1 px-4 pt-2 sm:px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setFilter(tab.value)}
                      aria-pressed={filter === tab.value}
                      className={`border-b-2 px-3 py-3 font-sans text-sm transition-colors ${
                        filter === tab.value
                          ? "border-teal font-semibold text-teal-dark"
                          : "border-transparent text-muted hover:text-ink"
                      }`}
                    >
                      {tab.label}
                      <span className="ml-1.5 text-xs text-muted">{counts[tab.value]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-b border-hairline p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="font-sans text-sm text-muted">
                  {isLoading ? t("loadingListings") : t("advertsCount").replace("{count}", String(filteredListings.length))}
                </p>
                <label className="relative block w-full sm:max-w-xs">
                  <span className="sr-only">{t("searchAdverts")}</span>
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t("searchAdverts")}
                    className="w-full rounded-md border border-hairline bg-white py-2.5 pl-9 pr-3 font-sans text-sm text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/10"
                  />
                </label>
              </div>

              {isLoading ? (
                <p className="px-6 py-12 text-center font-sans text-sm text-muted">{t("loadingListings")}</p>
              ) : filteredListings.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <p className="font-sans text-sm font-medium text-ink">
                    {listings.length === 0 ? t("noAdvertsYet") : t("noAdvertsMatch")}
                  </p>
                  <p className="mt-2 font-sans text-sm text-muted">{t("advertsEmptyHint")}</p>
                  {listings.length === 0 && (
                    <Link to="/listings/new" className="btn-primary mt-5 inline-flex">
                      + {t("postAd")}
                    </Link>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-hairline">
                  {filteredListings.map((listing) => (
                    <li key={listing.id} className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
                      <Link
                        to={`/listings/${listing.slug}`}
                        className="h-24 w-full shrink-0 overflow-hidden rounded-md bg-paper sm:h-24 sm:w-32"
                      >
                        {listing.primary_image ? (
                          <img
                            src={resolveImageUrl(listing.primary_image) ?? undefined}
                            alt={listing.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center font-sans text-xs text-muted">
                            {t("noImage")}
                          </span>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link to={`/listings/${listing.slug}`} className="line-clamp-2 font-sans text-sm font-semibold text-ink hover:text-teal">
                              {listing.title}
                            </Link>
                            <p className="price-tag mt-1 text-base">{Number(listing.price).toLocaleString()} Br</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 font-sans text-xs font-medium capitalize ${STATUS_STYLES[listing.status] ?? STATUS_STYLES.expired}`}>
                            {listing.status === "active" ? t("active") : t(listing.status)}
                          </span>
                        </div>
                        <p className="mt-1 font-sans text-xs text-muted">
                          {listing.city}, {listing.region} <span className="mx-1">·</span> {t("postedOn")} {formatListingDate(listing.created_at)}
                          {typeof listing.views_count === "number" && <> <span className="mx-1">·</span> {listing.views_count} {t("views")}</>}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                          <Link to={`/listings/${listing.slug}/edit`} className="font-sans text-xs font-medium text-teal-dark hover:underline">
                            {t("edit")}
                          </Link>
                          {listing.status === "active" && (
                            <button
                              type="button"
                              onClick={() => void handleMarkSold(listing.id)}
                              disabled={pendingId === listing.id}
                              className="font-sans text-xs font-medium text-amber-700 hover:underline disabled:opacity-50"
                            >
                              {t("markSold")}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => void handleRemove(listing.id)}
                            disabled={pendingId === listing.id}
                            className="font-sans text-xs font-medium text-rose-700 hover:underline disabled:opacity-50"
                          >
                            {pendingId === listing.id ? t("saving") : t("remove")}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
