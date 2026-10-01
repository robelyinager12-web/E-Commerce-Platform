import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchListings } from "../services/listing.service";
import { fetchCategories } from "../services/category.service";
import { ListingListItem } from "../types/listing.types";
import { Category } from "../types/category.types";
import { ListingCard } from "../components/listing/ListingCard";
import { getErrorMessage } from "../utils/getErrorMessage";

export function Home() {
  const [listings, setListings] = useState<ListingListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchListings({ limit: 8, sort: "newest" }), fetchCategories()])
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
    <div>
      <section className="border-b border-hairline bg-teal-light">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-teal-dark">
            Buy and sell anything, locally
          </p>
          <h1 className="mt-4 max-w-xl font-display text-5xl font-semibold leading-[1.1] text-ink">
            Find it nearby, or sell it today.
          </h1>
          <p className="mt-5 max-w-md font-sans text-base text-ink/70">
            Vehicles, property, electronics, and more — post an ad in minutes and talk to buyers
            directly.
          </p>
          <Link to="/listings" className="btn-primary mt-8">
            Browse listings
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-6 font-display text-xl font-semibold text-ink">Categories</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/listings?category=${category.slug}`}
              className="card flex items-center justify-center p-6 text-center font-sans text-sm font-medium text-ink hover:border-teal"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-8 font-display text-2xl font-semibold text-ink">Recently listed</h2>

        {isLoading && <p className="font-sans text-sm text-muted">Loading listings…</p>}
        {error && <p className="font-sans text-sm text-red-700">{error}</p>}

        {!isLoading && !error && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}