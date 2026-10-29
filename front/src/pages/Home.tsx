import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchListings } from "../services/listing.service";
import { fetchCategories } from "../services/category.service";
import { ListingListItem } from "../types/listing.types";
import { Category } from "../types/category.types";
import { ListingCard } from "../components/listing/ListingCard";
import { CategorySidebar } from "../components/listing/CategorySidebar";
import { NavSearch } from "../components/layout/NavSearch";
import { useLanguage } from "../context/LanguageContext";
import { categoryIcon } from "../constants/categoryIcons";
import { getErrorMessage } from "../utils/getErrorMessage";

export function Home() {
  const { t } = useLanguage();
  const [listings, setListings] = useState<ListingListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchListings({ limit: 12, sort: "newest" }), fetchCategories()])
      .then(([listingsRes, cats]) => {
        if (cancelled) return;
        setListings(listingsRes.items);
        setCategories(cats);
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

  const topLevelCategories = categories.filter((category) => !category.parent_id);

  return (
    <>
      <section className="rounded-b-3xl bg-teal px-4 pb-12 pt-8 sm:pb-16 sm:pt-12">
        <h1 className="text-center font-sans text-2xl font-bold text-white sm:text-3xl">
          {t("heroTitle")}
        </h1>
        <div className="mx-auto mt-6 max-w-3xl">
          <NavSearch size="lg" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
          {topLevelCategories.map((category) => (
            <Link
              key={category.id}
              to={`/listings?category=${encodeURIComponent(category.slug)}`}
              className="shrink-0 rounded-full border border-hairline bg-white px-4 py-2 font-sans text-sm text-ink hover:border-teal hover:text-teal"
            >
              <span aria-hidden="true" className="mr-1.5">
                {categoryIcon(category.slug)}
              </span>
              {category.name}
            </Link>
          ))}
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[250px_1fr]">
          <aside className="hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <CategorySidebar categories={categories} />
          </aside>

          <div className="min-w-0">
            <div className="mb-6 grid max-w-xl grid-cols-[1.3fr_1fr] gap-3">
              <Link
                to="/niche-intelligence"
                className="flex min-h-[74px] items-center justify-center gap-2 rounded-xl border border-[#b8b2f3] bg-[#dcdaf0] px-3 py-3 font-sans text-sm font-medium text-ink transition-colors hover:bg-[#d2cfeb] sm:text-lg"
              >
                <span aria-hidden="true" className="text-3xl leading-none sm:text-4xl">
                  🔎
                </span>
                <span>{t("nicheIntelligence")}</span>
              </Link>
              <Link
                to="/listings/new"
                className="flex min-h-[74px] items-center justify-center gap-2 rounded-xl border border-[#69d68c] bg-[#e5f5e9] px-3 py-3 font-sans text-sm font-medium text-ink transition-colors hover:bg-[#d9f0df] sm:text-lg"
              >
                <span aria-hidden="true" className="text-3xl leading-none sm:text-4xl">
                  💸
                </span>
                <span>{t("howToSell")}</span>
              </Link>
            </div>

            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              {t("recommendedForYou")}
            </h2>

            {isLoading && <p className="font-sans text-sm text-muted">{t("loadingListings")}</p>}
            {error && <p className="font-sans text-sm text-red-700">{error}</p>}

            {!isLoading && !error && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
