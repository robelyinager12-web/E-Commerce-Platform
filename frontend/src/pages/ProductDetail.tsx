import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductBySlug } from "../services/product.service";
import { fetchProductReviews } from "../services/review.service";
import { ProductDetail as ProductDetailType, ProductVariant } from "../types/product.types";
import { Review } from "../types/review.types";
import { StarRating } from "../components/common/StarRating";
import { ReviewItem, ReviewForm } from "../components/product/ReviewList";
import { useCart } from "../context/CartContext";
import { getErrorMessage } from "../utils/getErrorMessage";

/** Groups flat variant rows (e.g. Color=Black, Size=M) by their variant_name axis. */
function groupVariantsByAxis(variants: ProductVariant[]): Map<string, ProductVariant[]> {
  const groups = new Map<string, ProductVariant[]>();
  for (const variant of variants) {
    const existing = groups.get(variant.variant_name) ?? [];
    existing.push(variant);
    groups.set(variant.variant_name, existing);
  }
  return groups;
}

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();

  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addToCartError, setAddToCartError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setSelectedVariantId(null);
    setActiveImageIndex(0);
    setQuantity(1);
    setAddedToCart(false);

    fetchProductBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        if (data.variants.length > 0) {
          setSelectedVariantId(data.variants[0].id);
        }
        return fetchProductReviews(data.id);
      })
      .then((reviewData) => {
        if (!cancelled && reviewData) setReviews(reviewData.items);
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
  }, [slug]);

  const variantGroups = useMemo<Map<string, ProductVariant[]>>(
    () => (product ? groupVariantsByAxis(product.variants) : new Map()),
    [product]
  );

  const selectedVariant = product?.variants.find((v) => v.id === selectedVariantId) ?? null;
  const availableStock = selectedVariant ? selectedVariant.stock_quantity : product?.stock_quantity ?? 0;
  const displayPrice = product
    ? (parseFloat(product.base_price) + (selectedVariant ? parseFloat(selectedVariant.price_adjustment) : 0)).toFixed(2)
    : "0.00";

  async function handleAddToCart() {
    if (!product) return;
    setAddToCartError(null);
    setAddedToCart(false);
    setIsAdding(true);
    try {
      await addItem(product.id, quantity, selectedVariant?.id);
      setAddedToCart(true);
    } catch (err) {
      setAddToCartError(getErrorMessage(err));
    } finally {
      setIsAdding(false);
    }
  }

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-6 py-16 font-sans text-sm text-muted">Loading…</div>;
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="font-sans text-sm text-red-700">{error ?? "Product not found."}</p>
        <Link to="/products" className="btn-secondary mt-4 inline-flex">
          Back to products
        </Link>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : null;
  const activeImage = images?.[activeImageIndex] ?? null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <nav className="mb-8 font-sans text-sm text-muted">
        <Link to="/products" className="hover:text-teal">
          All products
        </Link>
        {product.categories[0] && (
          <>
            {" / "}
            <Link
              to={`/products?category=${product.categories[0].slug}`}
              className="hover:text-teal"
            >
              {product.categories[0].name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        {/* --- Gallery --- */}
        <div>
          <div className="card aspect-square overflow-hidden bg-teal-light">
            {activeImage ? (
              <img
                src={activeImage.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-muted">
                No image
              </div>
            )}
          </div>
          {images && images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`h-16 w-16 overflow-hidden rounded-sm border-2 ${
                    index === activeImageIndex ? "border-teal" : "border-transparent"
                  }`}
                >
                  <img src={image.image_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- Details --- */}
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2">
            <StarRating rating={parseFloat(product.average_rating)} />
            <span className="font-sans text-sm text-muted">
              {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </span>
          </div>

          <p className="price-tag mt-5 text-3xl">${displayPrice}</p>

          {product.description && (
            <p className="mt-5 font-sans text-sm leading-relaxed text-ink/80">
              {product.description}
            </p>
          )}

          {/* --- Variant selectors --- */}
          {Array.from(variantGroups.entries()).map(([axisName, options]) => (
            <div key={axisName} className="mt-6">
              <h3 className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">
                {axisName}
              </h3>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedVariantId(option.id)}
                    disabled={option.stock_quantity === 0}
                    className={`rounded-sm border px-3.5 py-2 font-sans text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                      selectedVariantId === option.id
                        ? "border-teal bg-teal-light text-teal-dark"
                        : "border-hairline text-ink/80 hover:border-ink/40"
                    }`}
                  >
                    {option.variant_value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* --- Stock + quantity --- */}
          <p className="mt-6 font-sans text-sm text-muted">
            {availableStock > 0
              ? availableStock <= 10
                ? `Only ${availableStock} left in stock`
                : "In stock"
              : "Out of stock"}
          </p>

          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center rounded-sm border border-hairline">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-ink/70 hover:text-ink"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="price-tag min-w-[2rem] text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                className="px-3 py-2 text-ink/70 hover:text-ink"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={availableStock === 0 || isAdding}
              className="btn-primary flex-1"
            >
              {isAdding ? "Adding…" : availableStock === 0 ? "Out of stock" : "Add to cart"}
            </button>
          </div>

          {addedToCart && (
            <p className="mt-3 font-sans text-sm text-teal-dark">Added to your cart.</p>
          )}
          {addToCartError && (
            <p className="mt-3 font-sans text-sm text-red-700">{addToCartError}</p>
          )}

          <p className="mt-6 font-mono text-xs text-muted">SKU: {product.sku}</p>
        </div>
      </div>

      {/* --- Reviews --- */}
      <section className="mt-16 max-w-2xl">
        <h2 className="mb-6 font-display text-2xl font-semibold text-ink">Reviews</h2>

        {reviews.length === 0 ? (
          <p className="font-sans text-sm text-muted">No reviews yet — be the first.</p>
        ) : (
          <div>
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
        )}

        <div className="mt-6">
          <ReviewForm
            productId={product.id}
            onSubmitted={(review) => setReviews((prev) => [review, ...prev])}
          />
        </div>
      </section>
    </div>
  );
}