import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchWishlist, removeFromWishlist } from "../services/wishlist.service";
import { WishlistItem } from "../types/wishlist.types";
import { useCart } from "../context/CartContext";
import { getErrorMessage } from "../utils/getErrorMessage";

export function Wishlist() {
  const { addItem } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWishlist()
      .then(setItems)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  function setPending(productId: string, isPending: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (isPending) next.add(productId);
      else next.delete(productId);
      return next;
    });
  }

  async function handleRemove(productId: string) {
    setPending(productId, true);
    try {
      const updated = await removeFromWishlist(productId);
      setItems(updated);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(productId, false);
    }
  }

  async function handleAddToCart(productId: string) {
    setPending(productId, true);
    try {
      await addItem(productId, 1);
      setAddedIds((prev) => new Set(prev).add(productId));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(productId, false);
    }
  }

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-6 py-16 font-sans text-sm text-muted">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink">Your wishlist</h1>

      {error && <p className="mb-4 font-sans text-sm text-red-700">{error}</p>}

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-sans text-sm text-muted">Nothing saved here yet.</p>
          <Link to="/products" className="btn-primary mt-6 inline-flex">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const isPending = pendingIds.has(item.product_id);
            const isAdded = addedIds.has(item.product_id);
            return (
              <div key={item.id} className="card overflow-hidden">
                <Link to={`/products/${item.product_slug}`} className="block aspect-square bg-teal-light">
                  {item.primary_image && (
                    <img
                      src={item.primary_image}
                      alt={item.product_name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </Link>
                <div className="p-4">
                  <Link
                    to={`/products/${item.product_slug}`}
                    className="font-sans text-sm font-medium text-ink hover:text-teal line-clamp-2"
                  >
                    {item.product_name}
                  </Link>
                  <p className="price-tag mt-2 text-base">${item.base_price}</p>

                  {!item.is_active && (
                    <p className="mt-2 font-sans text-xs text-muted">No longer available</p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item.product_id)}
                      disabled={isPending || !item.is_active}
                      className="btn-primary flex-1 !py-2 !text-xs"
                    >
                      {isAdded ? "Added" : "Add to cart"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.product_id)}
                      disabled={isPending}
                      className="btn-secondary !py-2 !text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}