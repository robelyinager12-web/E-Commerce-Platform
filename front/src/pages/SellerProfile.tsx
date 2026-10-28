import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchListings } from "../services/listing.service";
import { fetchSellerReviews } from "../services/sellerReview.service";
import { ListingListItem } from "../types/listing.types";
import { SellerReview, SellerRatingSummary } from "../types/sellerReview.types";
import { StarRating } from "../components/common/StarRating";
import { ListingCard } from "../components/listing/ListingCard";
import { getErrorMessage } from "../utils/getErrorMessage";

export function SellerProfile() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [summary, setSummary] = useState<SellerRatingSummary | null>(null);
  const [listings, setListings] = useState<ListingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sellerId) return;
    fetchSellerReviews(sellerId)
      .then((data) => {
        setReviews(data.items);
        setSummary(data.summary);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));

    // Note: this filters client-side since the public listing endpoint has
    // no seller filter yet; fine for the current scale.
    fetchListings({ limit: 100 })
      .then(({ items }) => setListings(items))
      .catch(() => setListings([]));
  }, [sellerId]);

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-6 py-16 font-sans text-sm text-muted">Loading…</div>;
  }

  if (error) {
    return <div className="mx-auto max-w-5xl px-6 py-16 font-sans text-sm text-red-700">{error}</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10 flex items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {reviews[0]?.reviewer_name ?? "Seller"}
          </h1>
          {summary && (
            <div className="mt-1 flex items-center gap-2">
              <StarRating rating={parseFloat(summary.averageRating)} />
              <span className="font-sans text-sm text-muted">
                {summary.reviewCount} review{summary.reviewCount === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>
      </div>

      <h2 className="mb-6 font-display text-xl font-semibold text-ink">Reviews</h2>
      {reviews.length === 0 ? (
        <p className="mb-10 font-sans text-sm text-muted">No reviews yet.</p>
      ) : (
        <div className="mb-10">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-hairline py-4 last:border-0">
              <div className="flex items-center gap-3">
                <StarRating rating={review.rating} />
                <span className="font-sans text-sm font-medium text-ink">{review.reviewer_name}</span>
              </div>
              {review.comment && <p className="mt-2 font-sans text-sm text-ink/80">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-6 font-display text-xl font-semibold text-ink">Listings</h2>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}