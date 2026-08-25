import { FormEvent, useState } from "react";
import { Review } from "../../types/review.types";
import { StarRating } from "../common/StarRating";
import { useAuth } from "../../context/AuthContext";
import { submitReview } from "../../services/review.service";
import { getErrorMessage } from "../../utils/getErrorMessage";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function ReviewItem({ review }: { review: Review }) {
  return (
    <div className="border-b border-hairline py-5 last:border-0">
      <div className="flex items-center gap-3">
        <StarRating rating={review.rating} />
        <span className="font-sans text-sm font-medium text-ink">{review.reviewer_name}</span>
        {review.is_verified_purchase && (
          <span className="rounded-sm bg-teal-light px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-teal-dark">
            Verified purchase
          </span>
        )}
      </div>
      {review.comment && (
        <p className="mt-2 font-sans text-sm text-ink/80">{review.comment}</p>
      )}
      <p className="mt-2 font-mono text-xs text-muted">{formatDate(review.created_at)}</p>
    </div>
  );
}

export function ReviewForm({
  productId,
  onSubmitted,
}: {
  productId: string;
  onSubmitted: (review: Review) => void;
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <p className="font-sans text-sm text-muted">
        Sign in to leave a review.
      </p>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const review = await submitReview(productId, { rating, comment: comment || undefined });
      onSubmitted(review);
      setComment("");
      setRating(5);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-hairline pt-6">
      <div className="flex items-center gap-2">
        <span className="font-sans text-sm text-ink">Your rating:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-xl ${star <= rating ? "text-gold" : "text-hairline"}`}
              aria-label={`${star} stars`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your thoughts (optional)"
        rows={3}
        className="input-field"
      />
      {error && <p className="font-sans text-sm text-red-700">{error}</p>}
      <button type="submit" className="btn-secondary self-start" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}