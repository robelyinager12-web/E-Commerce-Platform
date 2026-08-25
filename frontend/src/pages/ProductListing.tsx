import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts } from "../services/product.service";
import { fetchCategories } from "../services/category.service";
import { ProductListItem, PaginationMeta, SortOption } from "../types/product.types";
import { Category } from "../types/category.types";
import { ProductCard } from "../components/product/ProductCard";
import { ProductFilters } from "../components/product/ProductFilters";
import { Pagination } from "../components/common/Pagination";
import { getErrorMessage } from "../utils/getErrorMessage";

export function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category");
  const search = searchParams.get("search") ?? "";
  const sort = (searchParams.get("sort") as SortOption) ?? "newest";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const [products, setProducts] = useState<ProductListItem[]>([]);
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
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchProducts({
      page,
      category: category ?? undefined,
      search: search || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sort,
    })
      .then(({ items, meta: newMeta }) => {
        if (cancelled) return;
        setProducts(items);
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
  }, [category, search, sort, page, minPrice, maxPrice]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      // Any filter change resets pagination back to page 1.
      if (!("page" in updates)) {
        next.delete("page");
      }
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold text-ink">
          {category
            ? categories.find((c) => c.slug === category)?.name ?? "Products"
            : "All products"}
        </h1>
        {meta && (
          <p className="font-sans text-sm text-muted">
            {meta.totalItems} item{meta.totalItems === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <div className="mb-8">
        <input
          type="search"
          placeholder="Search products…"
          defaultValue={search}
          onChange={(e) => {
            const value = e.target.value;
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
            searchDebounceRef.current = setTimeout(
              () => updateParams({ search: value || null }),
              400
            );
          }}
          className="input-field max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <ProductFilters
          categories={categories}
          selectedCategory={category}
          onCategoryChange={(slug) => updateParams({ category: slug })}
          sort={sort}
          onSortChange={(value) => updateParams({ sort: value })}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={(min, max) => updateParams({ minPrice: min || null, maxPrice: max || null })}
        />

        <div>
          {isLoading && <p className="font-sans text-sm text-muted">Loading products…</p>}
          {error && <p className="font-sans text-sm text-red-700">{error}</p>}

          {!isLoading && !error && products.length === 0 && (
            <p className="font-sans text-sm text-muted">
              No products match your filters. Try widening your search.
            </p>
          )}

          {!isLoading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {meta && (
                <Pagination meta={meta} onPageChange={(p) => updateParams({ page: String(p) })} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}