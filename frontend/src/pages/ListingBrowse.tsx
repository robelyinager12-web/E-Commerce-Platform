import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchListings } from "../services/listing.service";
import { fetchCategories } from "../services/category.service";
import { ListingListItem, PaginationMeta } from "../types/listing.types";
import { Category } from "../types/category.types";
import { ListingCard } from "../components/listing/ListingCard";
import { ListingFilters } from "../components/listing/ListingFilters";
import { Pagination } from "../components/common/Pagination";
import { getErrorMessage } from "../utils/getErrorMessage";

export function ListingBrowse() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category");
  const search = searchParams.get("search") ?? "";
  const region = searchParams.get("region") ?? "";
  const condition = searchParams.get("condition") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const [listings, setListings] = useState<ListingListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    fetchCategories().then((cats) => setCategories(cats.filter((c) => !c.parent_id))).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchListings({
      page,
      category: category ?? undefined,
      search: search || undefined,
      region: region || undefined,
      condition: (condition || undefined) as "new" | "used" | undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sort: sort as "newest" | "price_asc" | "price_desc",
    })
      .then(({ items, meta: newMeta }) => {
        if (cancelled) return;
        setListings(items);
        setMeta(newMeta);
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
  }, [category, search, region, condition, sort, page, minPrice, maxPrice]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      if (!("page" in updates)) next.delete("page");
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold text-ink">
          {category ? categories.find((c) => c.slug === category)?.name ?? "Listings" : "All listings"}
        </h1>
        {meta && (
          <p className="font-sans text-sm text-muted">
            {meta.totalItems} listing{meta.totalItems === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <div className="mb-8">
        <input
          type="search"
          placeholder="Search listings…"
          defaultValue={search}
          onChange={(e) => {
            const value = e.target.value;
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
            searchDebounceRef.current = setTimeout(() => updateParams({ search: value || null }), 400);
          }}
          className="input-field max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <ListingFilters
          categories={categories}
          selectedCategory={category}
          onCategoryChange={(slug) => updateParams({ category: slug })}
          region={region}
          onRegionChange={(r) => updateParams({ region: r || null })}
          condition={condition}
          onConditionChange={(c) => updateParams({ condition: c || null })}
          sort={sort}
          onSortChange={(s) => updateParams({ sort: s })}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={(min, max) => updateParams({ minPrice: min || null, maxPrice: max || null })}
        />

        <div>
          {isLoading && <p className="font-sans text-sm text-muted">Loading…</p>}
          {error && <p className="font-sans text-sm text-red-700">{error}</p>}

          {!isLoading && !error && listings.length === 0 && (
            <p className="font-sans text-sm text-muted">
              No listings match your filters. Try widening your search.
            </p>
          )}

          {!isLoading && !error && listings.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              {meta && <Pagination meta={meta} onPageChange={(p) => updateParams({ page: String(p) })} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}