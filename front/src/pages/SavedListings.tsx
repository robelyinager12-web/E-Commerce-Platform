import { useState } from "react";
import { Link } from "react-router-dom";
import { useSavedListings } from "../context/SavedListingsContext";
import { useLanguage } from "../context/LanguageContext";
import { resolveImageUrl } from "../services/api";
import { getErrorMessage } from "../utils/getErrorMessage";

function formatSavedDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SavedListings() {
  const { saved, isLoading, toggleSave } = useSavedListings();
  const { t } = useLanguage();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove(listingId: string) {
    setError(null);
    setPendingId(listingId);
    try {
      await toggleSave(listingId);
    } catch (removeError) {
      setError(getErrorMessage(removeError));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="min-h-[60vh] bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-hairline pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">{t("account")}</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
              {t("savedListingsTitle")}
            </h1>
          </div>
          {!isLoading && saved.length > 0 && (
            <span className="rounded-full bg-white px-3 py-1 font-sans text-sm text-ink/70 ring-1 ring-hairline">
              {saved.length} {t("savedCount")}
            </span>
          )}
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-700">
            {error}
          </p>
        )}

        {isLoading && <p className="py-10 text-center font-sans text-sm text-muted">{t("loadingListings")}</p>}

        {!isLoading && saved.length === 0 && (
          <div className="rounded-xl border border-hairline bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-light text-teal">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M12 20.5s-7.5-4.6-9.2-9.3C1.7 8 3.6 5 6.6 5c1.9 0 3.5 1 4.4 2.4h2C13.9 6 15.5 5 17.4 5c3 0 4.9 3 3.8 6.2-1.7 4.7-9.2 9.3-9.2 9.3Z" />
              </svg>
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold text-ink">{t("savedEmptyTitle")}</h2>
            <p className="mx-auto mt-2 max-w-md font-sans text-sm leading-relaxed text-muted">
              {t("savedEmptyMessage")}
            </p>
            <Link to="/listings" className="btn-primary mt-6 inline-flex">
              {t("browseAll")}
            </Link>
          </div>
        )}

        {!isLoading && saved.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-xl border border-hairline bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative">
                  <Link
                    to={`/listings/${item.slug}`}
                    aria-label={item.title}
                    className="block aspect-[4/3] overflow-hidden bg-teal-light"
                  >
                    {item.primary_image ? (
                      <img
                        src={resolveImageUrl(item.primary_image) ?? undefined}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-sans text-sm text-muted">
                        {t("noImage")}
                      </div>
                    )}
                  </Link>
                  {item.status !== "active" && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-ink/70 shadow-sm">
                      {item.status}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleRemove(item.listing_id)}
                    disabled={pendingId === item.listing_id}
                    aria-label={t("removeSaved")}
                    title={t("removeSaved")}
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-rose-600 shadow-md transition-colors hover:bg-rose-50 disabled:opacity-50"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M12 20.5s-7.5-4.6-9.2-9.3C1.7 8 3.6 5 6.6 5c1.9 0 3.5 1 4.4 2.4h2C13.9 6 15.5 5 17.4 5c3 0 4.9 3 3.8 6.2-1.7 4.7-9.2 9.3-9.2 9.3Z" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <Link
                    to={`/listings/${item.slug}`}
                    className="line-clamp-2 min-h-10 font-sans text-sm font-medium leading-5 text-ink hover:text-teal"
                  >
                    {item.title}
                  </Link>
                  <p className="price-tag mt-2 text-lg">{Number(item.price).toLocaleString()} Br</p>
                  <p className="mt-2 font-sans text-xs text-muted">
                    {item.city}, {item.region}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
                    <span className="font-sans text-xs text-muted">
                      {t("savedOn")} {formatSavedDate(item.saved_at)}
                    </span>
                    <Link to={`/listings/${item.slug}`} className="font-sans text-xs font-semibold text-teal hover:underline">
                      {t("viewListing")}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
