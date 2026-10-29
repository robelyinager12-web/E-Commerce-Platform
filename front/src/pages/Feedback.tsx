import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StarRating } from "../components/common/StarRating";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { fetchSellerReviews } from "../services/sellerReview.service";
import { SellerRatingSummary, SellerReview } from "../types/sellerReview.types";
import { getErrorMessage } from "../utils/getErrorMessage";

function formatReviewDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function Feedback() {
  const { t, localize, language } = useLanguage();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [summary, setSummary] = useState<SellerRatingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    fetchSellerReviews(user.id, 1, 100)
      .then((data) => {
        if (cancelled) return;
        setReviews(data.items);
        setSummary(data.summary);
      })
      .catch((fetchError) => {
        if (!cancelled) setError(getErrorMessage(fetchError));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const sideLink = "block rounded-md px-4 py-3 text-sm transition-colors";

  return (
    <div className="min-h-[70vh] bg-form-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 font-sans text-sm text-muted">
          <Link to="/profile/shop" className="hover:text-teal">
            {t("myShop")}
          </Link>
          <span className="mx-2">/</span>
          {t("feedback")}
        </p>
        <div className="mb-7">
          <h1 className="font-display text-2xl font-semibold text-ink">{t("feedback")}</h1>
          <p className="mt-2 font-sans text-sm text-muted">
            {localize("See what buyers say about their experience with you.")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[230px_minmax(0,1fr)]">
          <nav aria-label={localize("Seller account")} className="h-fit rounded-lg bg-white p-2 shadow-sm">
            <p className="px-4 pb-2 pt-3 font-mono text-[11px] uppercase tracking-widest text-muted">
              {localize("My account")}
            </p>
            <Link to="/profile/shop" className={`${sideLink} text-ink hover:bg-paper`}>
              {t("myShop")}
            </Link>
            <Link
              to="/profile/feedback"
              aria-current="page"
              className={`${sideLink} bg-teal-light font-medium text-teal-dark`}
            >
              {t("feedback")}
            </Link>
            <Link to="/profile/statistics" className={`${sideLink} text-ink hover:bg-paper`}>
              {t("performance")}
            </Link>
            <Link to="/profile/settings/contact-details" className={`${sideLink} text-ink hover:bg-paper`}>
              {t("settings")}
            </Link>
          </nav>

          <div className="min-w-0">
            {isLoading && <p className="rounded-lg bg-white p-5 font-sans text-sm text-muted">{localize("Loading feedback…")}</p>}
            {error && <p role="alert" className="rounded-lg bg-white p-5 font-sans text-sm text-red-700">{error}</p>}

            {!isLoading && !error && (
              <>
                <section className="flex flex-wrap items-center gap-5 rounded-lg border border-hairline bg-white p-5 sm:p-7">
                  <div className="text-center">
                    <p className="font-display text-4xl font-semibold text-ink">
                      {summary?.averageRating ?? "0"}
                    </p>
                    <StarRating rating={Number(summary?.averageRating ?? 0)} size="md" />
                  </div>
                  <div className="border-l border-hairline pl-5">
                    <p className="font-sans text-sm font-medium text-ink">
                      {summary?.reviewCount ?? 0}{" "}
                      {(summary?.reviewCount ?? 0) === 1 ? localize("review") : localize("reviews")}
                    </p>
                    <p className="mt-1 font-sans text-xs text-muted">{localize("Your overall buyer rating")}</p>
                  </div>
                </section>

                <section className="mt-6 overflow-hidden rounded-lg border border-hairline bg-white">
                  <div className="border-b border-hairline px-5 py-4">
                    <h2 className="font-display text-lg font-semibold text-ink">{localize("Reviews from buyers")}</h2>
                  </div>

                  {reviews.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                      <p className="font-sans text-sm font-medium text-ink">{localize("No feedback yet")}</p>
                      <p className="mt-2 font-sans text-sm text-muted">
                        {localize("Buyer reviews will appear here after they rate their experience.")}
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-hairline">
                      {reviews.map((review) => (
                        <li key={review.id} className="px-5 py-5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-sans text-sm font-medium text-ink">{review.reviewer_name}</p>
                              <StarRating rating={review.rating} />
                            </div>
                            <time
                              dateTime={review.created_at}
                              className="font-sans text-xs text-muted"
                            >
                              {new Date(review.created_at).toLocaleDateString(language === "am" ? "am-ET" : language === "om" ? "om-ET" : "en-ET", { year: "numeric", month: "long", day: "numeric" })}
                            </time>
                          </div>
                          {review.comment ? (
                            <p className="mt-3 whitespace-pre-line font-sans text-sm leading-relaxed text-ink/80">
                              {review.comment}
                            </p>
                          ) : (
                            <p className="mt-3 font-sans text-sm italic text-muted">{localize("No written comment.")}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
