import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/product.service";
import { ProductListItem } from "../types/product.types";
import { ProductCard } from "../components/product/ProductCard";
import { getErrorMessage } from "../utils/getErrorMessage";

export function Home() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchProducts({ limit: 8 })
      .then(({ items }) => {
        if (!cancelled) setProducts(items);
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
            New season, considered goods
          </p>
          <h1 className="mt-4 max-w-xl font-display text-5xl font-semibold leading-[1.1] text-ink">
            Everyday things, chosen carefully.
          </h1>
          <p className="mt-5 max-w-md font-sans text-base text-ink/70">
            Electronics, clothing, home goods, and books — curated in one place, with the
            details that make them worth keeping.
          </p>
          <Link to="/products" className="btn-primary mt-8">
            Shop all products
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-8 font-display text-2xl font-semibold text-ink">Recently added</h2>

        {isLoading && <p className="font-sans text-sm text-muted">Loading products…</p>}
        {error && <p className="font-sans text-sm text-red-700">{error}</p>}

        {!isLoading && !error && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}