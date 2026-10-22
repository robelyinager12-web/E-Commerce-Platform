import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchListings } from "../services/listing.service";
import { fetchCategories } from "../services/category.service";
import { ListingListItem } from "../types/listing.types";
import { Category } from "../types/category.types";
import { ListingCard } from "../components/listing/ListingCard";
import { CategorySidebar } from "../components/listing/CategorySidebar";
import { useLanguage } from "../context/LanguageContext";
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
        setCategories(cats.filter((c) => !c.parent_id));
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
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Category chips on phones / tablets */}
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/listings?category=${encodeURIComponent(category.slug)}`}
            className="shrink-0 rounded-full border border-hairline bg-white px-4 py-2 font-sans text-sm text-ink hover:border-teal hover:text-teal"
          >
            {category.name}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        {/* Desktop category sidebar */}
        <aside className="hidden lg:block">
          <CategorySidebar categories={categories} />
        </aside>

        <div className="min-w-0">
          {/* Promo banner */}
          <div className="flex flex-col justify-between gap-4 rounded-sm bg-teal-light p-6 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink">{t("tagline")}</h1>
              <p className="mt-1 max-w-md font-sans text-sm text-ink/70">{t("bannerText")}</p>
            </div>
            <Link to="/listings/new" className="btn-primary shrink-0">
              {t("postAd")}
            </Link>
          </div>

          <h2 className="mb-4 mt-8 font-display text-xl font-semibold text-ink">
            {t("recentlyListed")}
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
  );
}