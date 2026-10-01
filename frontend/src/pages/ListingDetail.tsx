import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchListingBySlug, fetchSellerContact } from "../services/listing.service";
import { fetchSellerReviews, submitSellerReview } from "../services/sellerReview.service";
import { ListingDetail as ListingDetailType, SellerContact } from "../types/listing.types";
import { SellerReview } from "../types/sellerReview.types";
import { StarRating } from "../components/common/StarRating";
import { ReportListingModal } from "../components/listing/ReportListingModal";
import { useAuth } from "../context/AuthContext";
import { useSavedListings } from "../context/SavedListingsContext";
import { getErrorMessage } from "../utils/getErrorMessage";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function ListingDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedListings();
  const navigate = useNavigate();

  const [listing, setListing] = useState<ListingDetailType | null>(null);
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [contact, setContact] = useState<SellerContact | null>(null);
  const [isRevealingContact, setIsRevealingContact] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const [showReport, setShowReport] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setIsLoading(true);
    setContact(null);
    setActiveImageIndex(0);

    fetchListingBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        setListing(data);
        return fetchSellerReviews(data.seller.id);
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

  async function handleRevealContact() {
    if (!user) {
      navigate("/login", { state: { from: `/listings/${slug}` } });
      return;
    }
    if (!listing) return;
    setContactError(null);
    setIsRevealingContact(true);
    try {
      setContact(await fetchSellerContact(listing.id));
    } catch (err) {
      setContactError(getErrorMessage(err));
    } finally {
      setIsRevealingContact(false);
    }
  }

  async function handleToggleSave() {
    if (!user) {
      navigate("/login", { state: { from: `/listings/${slug}` } });
      return;
    }
    if (!listing) return;
    await toggleSave(listing.id);
  }

  async function handleSubmitReview() {
    if (!listing) return;
    setReviewError(null);
    setIsSubmittingReview(true);
    try {
      const review = await submitSellerReview(listing.seller.id, {
        rating: reviewRating,
        comment: reviewComment || undefined,
      });
      setReviews((prev) => [review, ...prev]);
      setReviewComment("");
      setReviewRating(5);
    } catch (err) {
      setReviewError(getErrorMessage(err));
    } finally {
      setIsSubmittingReview(false);
    }
  }

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-6 py-16 font-sans text-sm text-muted">Loading…</div>;
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="font-sans text-sm text-red-700">{error ?? "Listing not found."}</p>
        <Link to="/listings" className="btn-secondary mt-4 inline-flex">
          Back to listings
        </Link>
      </div>
    );
  }

  const images = listing.images.length > 0 ? listing.images : null;
  const activeImage = images?.[activeImageIndex] ?? null;
  const isOwnListing = user?.id === listing.seller.id;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <nav className="mb-8 font-sans text-sm text-muted">
        <Link to="/listings" className="hover:text-teal">
          All listings
        </Link>
        {" / "}
        <Link to={`/listings?category=${listing.category.slug}`} className="hover:text-teal">
          {listing.category.name}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <div className="card aspect-square overflow-hidden bg-teal-light">
            {activeImage ? (
              <img src={activeImage.image_url} alt={listing.title} className="h-full w-full object-cover" />
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

        <div>
          <div className="flex items-start justify-between">
            <h1 className="font-display text-2xl font-semibold text-ink">{listing.title}</h1>
            <button
              type="button"
              onClick={handleToggleSave}
              className="shrink-0 font-sans text-sm text-teal hover:underline"
            >
              {isSaved(listing.id) ? "Saved ✓" : "Save"}
            </button>
          </div>

          <p className="price-tag mt-3 text-3xl">{Number(listing.price).toLocaleString()} Br</p>

          <div className="mt-3 flex flex-wrap items-center gap-3 font-sans text-sm text-ink/70">
            <span className="rounded-sm bg-teal-light px-2 py-0.5 font-mono text-xs uppercase text-teal-dark">
              {listing.condition}
            </span>
            <span>
              {listing.city}, {listing.region}
            </span>
            <span>·</span>
            <span>{listing.views_count} views</span>
            <span>·</span>
            <span>Posted {formatDate(listing.created_at)}</span>
          </div>

          {listing.description && (
            <p className="mt-5 whitespace-pre-line font-sans text-sm leading-relaxed text-ink/80">
              {listing.description}
            </p>
          )}

          <div className="card mt-6 p-4">
            <p className="font-sans text-sm font-medium text-ink">
              {listing.seller.firstName} {listing.seller.lastName}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <StarRating rating={parseFloat(listing.seller.averageRating)} />
              <span className="font-sans text-xs text-muted">
                {listing.seller.reviewCount} review{listing.seller.reviewCount === 1 ? "" : "s"}
              </span>
            </div>
            <p className="mt-1 font-sans text-xs text-muted">
              Member since {formatDate(listing.seller.memberSince)}
            </p>
          </div>

          {!isOwnListing && (
            <div className="mt-4">
              {contact ? (
                <div className="card p-4">
                  <p className="font-sans text-sm text-ink">
                    {contact.firstName} {contact.lastName}
                  </p>
                  {contact.phone && <p className="price-tag mt-1">{contact.phone}</p>}
                  <p className="mt-1 font-sans text-sm text-ink/70">{contact.email}</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRevealContact}
                  disabled={isRevealingContact}
                  className="btn-primary w-full"
                >
                  {isRevealingContact ? "Loading…" : "Show contact info"}
                </button>
              )}
              {contactError && <p className="mt-2 font-sans text-sm text-red-700">{contactError}</p>}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowReport(true)}
            className="mt-4 font-sans text-xs text-muted hover:text-red-700"
          >
            Report this listing
          </button>
        </div>
      </div>

      <section className="mt-16 max-w-2xl">
        <h2 className="mb-6 font-display text-2xl font-semibold text-ink">
          Reviews of {listing.seller.firstName}
        </h2>

        {reviews.length === 0 ? (
          <p className="font-sans text-sm text-muted">No reviews yet.</p>
        ) : (
          <div>
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-hairline py-5 last:border-0">
                <div className="flex items-center gap-3">
                  <StarRating rating={review.rating} />
                  <span className="font-sans text-sm font-medium text-ink">{review.reviewer_name}</span>
                </div>
                {review.comment && (
                  <p className="mt-2 font-sans text-sm text-ink/80">{review.comment}</p>
                )}
                <p className="mt-2 font-mono text-xs text-muted">{formatDate(review.created_at)}</p>
              </div>
            ))}
          </div>
        )}

        {user && !isOwnListing && (
          <div className="mt-6 flex flex-col gap-3 border-t border-hairline pt-6">
            <div className="flex items-center gap-2">
              <span className="font-sans text-sm text-ink">Your rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={`text-xl ${star <= reviewRating ? "text-gold" : "text-hairline"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience with this seller (optional)"
              rows={3}
              className="input-field"
            />
            {reviewError && <p className="font-sans text-sm text-red-700">{reviewError}</p>}
            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={isSubmittingReview}
              className="btn-secondary self-start"
            >
              {isSubmittingReview ? "Submitting…" : "Submit review"}
            </button>
          </div>
        )}
      </section>

      {showReport && <ReportListingModal listingId={listing.id} onClose={() => setShowReport(false)} />}
    </div>
  );
}