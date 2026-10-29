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
import { resolveImageUrl } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function ListingDetail() {
  const { localize, language } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedListings();
  const navigate = useNavigate();

  const [listing, setListing] = useState<ListingDetailType | null>(null);
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

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
    window.scrollTo(0, 0);
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

  useEffect(() => {
    if (!isGalleryOpen || !listing || listing.images.length < 1) return;
    const imageCount = listing.images.length;

    function handleGalleryKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsGalleryOpen(false);
      if (event.key === "ArrowLeft") {
        setActiveImageIndex((index) => (index - 1 + imageCount) % imageCount);
      }
      if (event.key === "ArrowRight") {
        setActiveImageIndex((index) => (index + 1) % imageCount);
      }
    }

    document.addEventListener("keydown", handleGalleryKeyDown);
    return () => document.removeEventListener("keydown", handleGalleryKeyDown);
  }, [isGalleryOpen, listing]);

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
    return <div className="mx-auto max-w-6xl px-6 py-16 font-sans text-sm text-muted">{localize("Loading…")}</div>;
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="font-sans text-sm text-red-700">{error ?? localize("Listing not found.")}</p>
        <Link to="/listings" className="btn-secondary mt-4 inline-flex">
          {localize("Back to listings")}
        </Link>
      </div>
    );
  }

  const images = listing.images.length > 0 ? listing.images : null;
  const activeImage = images?.[activeImageIndex] ?? null;
  const isOwnListing = user?.id === listing.seller.id;

  return (
    <div className="min-h-screen bg-ink/[0.03]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <nav className="mb-5 font-sans text-sm text-muted">
        <Link to="/listings" className="hover:text-teal">
          {localize("All listings")}
        </Link>
        {" / "}
        <Link to={`/listings?category=${listing.category.slug}`} className="hover:text-teal">
          {listing.category.name}
        </Link>
      </nav>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.9fr)_minmax(290px,0.9fr)]">
        <main className="min-w-0 space-y-5">
          <section className="card overflow-hidden border-t-4 border-t-teal">
            <div className="relative aspect-[3/2] bg-ink/5">
              {activeImage ? (
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(true)}
                  aria-label={localize("View listing photos")}
                  className="absolute inset-0 h-full w-full cursor-zoom-in"
                >
                  <img
                    src={resolveImageUrl(activeImage.image_url) ?? undefined}
                    alt={listing.title}
                    className="h-full w-full object-contain"
                  />
                </button>
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-muted">
                  {localize("No image")}
                </div>
              )}
              <button
                type="button"
                onClick={handleToggleSave}
                aria-label={localize(isSaved(listing.id) ? "Remove saved listing" : "Save listing")}
                className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 font-sans text-sm text-teal-dark shadow-sm"
              >
                <span aria-hidden="true">{isSaved(listing.id) ? "♥" : "♡"}</span>
                {isSaved(listing.id) ? localize("Saved") : localize("Save")}
              </button>
              {images && images.length > 1 && (
                <span className="absolute bottom-4 right-4 rounded-full bg-black/65 px-3 py-1 font-sans text-sm text-white">
                  {activeImageIndex + 1} / {images.length}
                </span>
              )}
            </div>
            {images && images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-t border-hairline p-3">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`${localize("View photo")} ${index + 1}`}
                    aria-current={index === activeImageIndex ? "true" : undefined}
                    className={`h-16 w-16 shrink-0 overflow-hidden border-2 ${
                      index === activeImageIndex ? "border-teal" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={resolveImageUrl(image.image_url) ?? undefined}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="card p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{listing.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-sm text-muted">
                  <span>{listing.city}, {listing.region}</span>
                  <span>{listing.views_count} {localize("views")}</span>
                  <span>{localize("Posted")} {formatDate(listing.created_at)}</span>
                </div>
              </div>
              <span className="rounded-sm bg-teal-light px-3 py-1 font-mono text-xs uppercase text-teal-dark">
                {localize(listing.condition)}
              </span>
            </div>

            <div className="mt-6 grid gap-x-8 gap-y-5 border-y border-hairline py-5 sm:grid-cols-2">
              <div>
                <p className="font-sans text-base text-ink">{listing.category.name}</p>
                <p className="mt-1 font-sans text-xs uppercase text-muted">{localize("Category")}</p>
              </div>
              <div>
                <p className="font-sans text-base text-ink">{localize(listing.condition)}</p>
                <p className="mt-1 font-sans text-xs uppercase text-muted">{localize("Condition")}</p>
              </div>
              <div>
                <p className="font-sans text-base text-ink">{listing.region}</p>
                <p className="mt-1 font-sans text-xs uppercase text-muted">{localize("Region")}</p>
              </div>
              <div>
                <p className="font-sans text-base text-ink">{listing.city}</p>
                <p className="mt-1 font-sans text-xs uppercase text-muted">{localize("City")}</p>
              </div>
            </div>

            <h2 className="mt-6 text-lg font-semibold text-ink">{localize("Description")}</h2>
            <p className="mt-3 whitespace-pre-line font-sans text-sm leading-relaxed text-ink/80">
              {listing.description || localize("No description provided.")}
            </p>
          </section>
        </main>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <section className="card p-5">
            <p className="price-tag text-3xl">
              {new Intl.NumberFormat(language === "am" ? "am-ET" : language === "om" ? "om-ET" : "en-ET", {
                style: "currency",
                currency: "ETB",
                maximumFractionDigits: 0,
              }).format(Number(listing.price))}
            </p>
          </section>

          <section className="card p-5">
            <Link to={`/sellers/${listing.seller.id}`} className="block hover:text-teal-dark">
              <p className="font-sans text-lg font-semibold text-ink">
                {listing.seller.firstName} {listing.seller.lastName}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StarRating rating={parseFloat(listing.seller.averageRating)} />
                <span className="font-sans text-xs text-muted">
                  {listing.seller.reviewCount} {listing.seller.reviewCount === 1 ? localize("review") : localize("reviews")}
                </span>
              </div>
              <p className="mt-2 font-sans text-xs text-muted">
                {localize("Member since")} {formatDate(listing.seller.memberSince)}
              </p>
            </Link>

            {!isOwnListing && (
              <div className="mt-5">
                {contact ? (
                  <div className="space-y-2 border-t border-hairline pt-4">
                    <p className="font-sans text-sm font-medium text-ink">
                      {contact.firstName} {contact.lastName}
                    </p>
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} className="btn-primary w-full">
                        {contact.phone}
                      </a>
                    )}
                    <a href={`mailto:${contact.email}`} className="btn-secondary w-full">
                      {contact.email}
                    </a>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRevealContact}
                    disabled={isRevealingContact}
                    className="btn-primary w-full"
                  >
                    {localize(isRevealingContact ? "Loading…" : "Show contact info")}
                  </button>
                )}
                {contactError && <p className="mt-2 font-sans text-sm text-red-700">{contactError}</p>}
              </div>
            )}
          </section>

          <section className="card p-5">
            <h2 className="text-base font-semibold text-ink">{localize("Safety tips")}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 font-sans text-sm text-ink/80">
              <li>{localize("Avoid paying in advance, even for delivery")}</li>
              <li>{localize("Meet with the seller at a safe public place")}</li>
              <li>{localize("Check the item before you pay")}</li>
              <li>{localize("Only pay if you are satisfied")}</li>
              <li>{localize("Arrange payment directly with the seller. Heroy Market does not collect payment.")}</li>
            </ul>
          </section>

          <button
            type="button"
            onClick={() => setShowReport(true)}
            className="card w-full p-4 text-left font-sans text-sm text-red-700 hover:bg-red-50"
          >
            {localize("Report this listing")}
          </button>
        </aside>
      </div>

      {isGalleryOpen && images && activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={localize("Listing photo gallery")}
          onClick={() => setIsGalleryOpen(false)}
        >
          <div className="flex h-full w-full max-w-6xl flex-col" onClick={(event) => event.stopPropagation()}>
            <div className="flex h-12 shrink-0 items-center justify-between text-white">
              <span className="font-sans text-sm">{activeImageIndex + 1} / {images.length}</span>
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                aria-label={localize("Close photo gallery")}
                className="grid h-10 w-10 place-items-center text-3xl leading-none hover:text-white/70"
              >
                &times;
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              <img
                src={resolveImageUrl(activeImage.image_url) ?? undefined}
                alt={listing.title}
                className="max-h-full max-w-full object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex((index) => (index - 1 + images.length) % images.length)}
                    aria-label={localize("Previous photo")}
                    className="absolute left-0 grid h-12 w-12 place-items-center bg-black/50 text-3xl text-white hover:bg-black/80"
                  >
                    &#8249;
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex((index) => (index + 1) % images.length)}
                    aria-label={localize("Next photo")}
                    className="absolute right-0 grid h-12 w-12 place-items-center bg-black/50 text-3xl text-white hover:bg-black/80"
                  >
                    &#8250;
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex shrink-0 justify-center gap-2 overflow-x-auto py-4">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`${localize("View photo")} ${index + 1}`}
                    aria-current={index === activeImageIndex ? "true" : undefined}
                    className={`h-14 w-14 shrink-0 overflow-hidden border-2 ${
                      index === activeImageIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={resolveImageUrl(image.image_url) ?? undefined}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <section className="card mt-5 max-w-4xl p-5 sm:p-7">
        <h2 className="mb-6 font-display text-2xl font-semibold text-ink">
          {localize("Reviews of")} {listing.seller.firstName}
        </h2>

        {reviews.length === 0 ? (
          <p className="font-sans text-sm text-muted">{localize("No reviews yet.")}</p>
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
              <span className="font-sans text-sm text-ink">{localize("Your rating:")}</span>
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
              placeholder={localize("Share your experience with this seller (optional)")}
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
              {localize(isSubmittingReview ? "Submitting…" : "Submit review")}
            </button>
          </div>
        )}
      </section>

      {showReport && <ReportListingModal listingId={listing.id} onClose={() => setShowReport(false)} />}
      </div>
    </div>
  );
}