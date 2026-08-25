export function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const rounded = Math.round(rating * 2) / 2; // nearest half star
  const textSize = size === "md" ? "text-base" : "text-sm";

  return (
    <div className={`flex items-center gap-0.5 ${textSize}`} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rounded ? "text-gold" : "text-hairline"}>
          ★
        </span>
      ))}
    </div>
  );
}