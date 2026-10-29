import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Category } from "../types/category.types";
import { ListingListItem, PaginationMeta } from "../types/listing.types";
import { categoryIcon } from "../constants/categoryIcons";
import { useLanguage } from "../context/LanguageContext";
import { fetchCategories } from "../services/category.service";
import { fetchListings } from "../services/listing.service";
import { getErrorMessage } from "../utils/getErrorMessage";

export function NicheIntelligence() {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<ListingListItem[]>([]);
  const [listingMeta, setListingMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const numberLocale = language === "am" ? "am-ET" : language === "om" ? "om-ET" : "en-ET";
  const formatCount = (value: number) =>
    new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 0 }).format(value);
  const formatPrice = (value: string) =>
    new Intl.NumberFormat(numberLocale, {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(Number(value));

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchCategories(),
      fetchListings({ limit: 6, sort: "newest" }),
    ])
      .then(([allCategories, listingResponse]) => {
        if (cancelled) return;
        setCategories(allCategories.filter((category) => !category.parent_id));
        setListings(listingResponse.items);
        setListingMeta(listingResponse.meta);
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

  return (
    <div className="min-h-screen bg-form-bg">
      <section className="bg-teal px-4 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-white/75">
            {t("marketInsights")}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold sm:text-5xl">
            {t("discoverMarketOpportunities")}
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-base text-white/85 sm:text-lg">
            {t("marketInsightsDescription")}
          </p>
          <Link
            to="/listings"
            className="mt-7 inline-flex rounded-md bg-white px-5 py-3 font-sans text-sm font-semibold text-teal-dark transition-colors hover:bg-teal-light"
          >
            {t("exploreListings")}
          </Link>

          <div className="mt-10 grid max-w-xl grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/20 bg-white/10 p-4">
              <p className="font-sans text-sm text-white/75">{t("availableListings")}</p>
              <p className="mt-1 font-display text-3xl font-semibold">
                {isLoading ? "—" : formatCount(listingMeta?.totalItems ?? 0)}
              </p>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/10 p-4">
              <p className="font-sans text-sm text-white/75">{t("marketCategories")}</p>
              <p className="mt-1 font-display text-3xl font-semibold">
                {isLoading ? "—" : formatCount(categories.length)}
              </p>
            </div>
          </div>
          <p className="mt-3 font-sans text-xs text-white/70">{t("marketDataNote")}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <section>
          <div className="mb-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-teal-dark">
              {t("explore")}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
              {t("exploreMarketCategories")}
            </h2>
          </div>

          {isLoading && <p className="rounded-lg bg-white p-5 font-sans text-sm text-muted">{t("loadingListings")}</p>}
          {error && <p role="alert" className="rounded-lg bg-white p-5 font-sans text-sm text-red-700">{error}</p>}

          {!isLoading && !error && categories.length === 0 && (
            <p className="rounded-lg bg-white p-5 font-sans text-sm text-muted">{t("noCategories")}</p>
          )}

          {!isLoading && !error && categories.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/listings?category=${encodeURIComponent(category.slug)}`}
                  className="group flex items-start gap-4 rounded-lg border border-hairline bg-white p-5 transition-colors hover:border-teal"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-teal-light text-2xl">
                    {categoryIcon(category.slug)}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg font-semibold text-ink group-hover:text-teal-dark">
                      {category.name}
                    </span>
                    <span className="mt-1 block font-sans text-sm text-muted">
                      {category.description || t("browseCategoryListings")}
                    </span>
                  </span>
                  <span aria-hidden="true" className="ml-auto text-lg text-teal-dark">→</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {!isLoading && !error && listings.length > 0 && (
          <section className="mt-12">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-teal-dark">
                  {t("freshFromMarketplace")}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                  {t("recentlyListed")}
                </h2>
              </div>
              <Link to="/listings" className="font-sans text-sm font-medium text-teal-dark hover:underline">
                {t("browseAll")}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/listings/${listing.slug}`}
                  className="rounded-lg border border-hairline bg-white p-3 transition-colors hover:border-teal"
                >
                  <span className="line-clamp-2 block min-h-10 font-sans text-sm font-medium text-ink">
                    {listing.title}
                  </span>
                  <span className="mt-2 block font-mono text-sm font-semibold text-teal-dark">
                    {formatPrice(listing.price)}
                  </span>
                  <span className="mt-1 block font-sans text-xs text-muted">
                    {listing.city}, {listing.region}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 rounded-lg border border-hairline bg-white p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-teal-dark">{t("howItWorks")}</p>
          <div className="mt-5 grid gap-6 sm:grid-cols-3">
            {[t("marketStepOne"), t("marketStepTwo"), t("marketStepThree")].map((step, index) => (
              <div key={step}>
                <span className="font-mono text-sm font-semibold text-teal-dark">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 font-sans text-sm leading-6 text-muted">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
