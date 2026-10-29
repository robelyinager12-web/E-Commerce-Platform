import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ListingCard } from "../components/listing/ListingCard";
import { StarRating } from "../components/common/StarRating";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { fetchMyListings } from "../services/listing.service";
import { fetchSellerReviews } from "../services/sellerReview.service";
import { ListingListItem } from "../types/listing.types";
import { SellerRatingSummary } from "../types/sellerReview.types";
import { getErrorMessage } from "../utils/getErrorMessage";
import { getMyAdvertsPath } from "../utils/profileRoutes";

function memberDuration(createdAt: string | undefined, localize: (text: string) => string): string | null {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  const months = Math.max(
    0,
    (new Date().getFullYear() - date.getFullYear()) * 12 + new Date().getMonth() - date.getMonth()
  );
  if (months < 1) return localize("Member since this month");
  if (months < 12) {
    return `${months}+ ${months === 1 ? localize("month") : localize("months")} ${localize("on Heroy Market")}`;
  }
  const years = Math.floor(months / 12);
  return `${years}+ ${years === 1 ? localize("year") : localize("years")} ${localize("on Heroy Market")}`;
}

export function Shop() {
  const { t, localize } = useLanguage();
  const { user } = useAuth();
  const [listings, setListings] = useState<ListingListItem[]>([]);
  const [summary, setSummary] = useState<SellerRatingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    Promise.allSettled([fetchMyListings(), fetchSellerReviews(user.id, 1, 1)])
      .then(([listingsResult, reviewsResult]) => {
        if (cancelled) return;
        if (listingsResult.status === "fulfilled") {
          setListings(listingsResult.value);
        } else {
          setError(getErrorMessage(listingsResult.reason));
        }
        if (reviewsResult.status === "fulfilled") {
          setSummary(reviewsResult.value.summary);
        } else {
          setFeedbackError(getErrorMessage(reviewsResult.reason));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const activeListings = useMemo(
    () => listings.filter((listing) => listing.status === "active"),
    [listings]
  );
  const sideLink = "block rounded-md px-4 py-3 text-sm transition-colors";

  return (
    <div className="min-h-[70vh] bg-form-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 font-sans text-sm text-muted">
          <Link to="/listings" className="hover:text-teal">
            {t("browseAll")}
          </Link>
          <span className="mx-2">/</span>
          {t("myShop")}
        </p>
        <div className="grid gap-6 md:grid-cols-[230px_minmax(0,1fr)]">
          <nav aria-label={localize("Seller account")} className="h-fit rounded-lg bg-white p-2 shadow-sm">
            <p className="px-4 pb-2 pt-3 font-mono text-[11px] uppercase tracking-widest text-muted">
              {localize("My account")}
            </p>
            <Link
              to="/profile/shop"
              aria-current="page"
              className={`${sideLink} bg-teal-light font-medium text-teal-dark`}
            >
              {t("myShop")}
            </Link>
            <Link to={getMyAdvertsPath(user?.id)} className={`${sideLink} text-ink hover:bg-paper`}>
              {localize("Manage ads")}
            </Link>
            <Link to="/profile/feedback" className={`${sideLink} text-ink hover:bg-paper`}>
              {t("feedback")}
            </Link>
            <Link to="/profile/statistics" className={`${sideLink} text-ink hover:bg-paper`}>
              {t("performance")}
            </Link>
            <Link to="/profile/settings/contact-details" className={`${sideLink} text-ink hover:bg-paper`}>
              {t("settings")}
            </Link>
          </nav>

          <main className="min-w-0">
            <section className="rounded-lg border border-hairline bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-5">
                <div
                  aria-hidden="true"
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-teal-light font-display text-2xl font-semibold text-teal-dark"
                >
                  {user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : ""}
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-2xl font-semibold text-ink">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <p className="mt-1 font-sans text-sm text-muted">
                    {memberDuration(user?.createdAt, localize) ?? localize("Heroy Market seller")}
                  </p>
                </div>
                <div className="ml-auto flex flex-wrap gap-2">
                  <Link to="/listings/new" className="btn-primary !py-2 !text-sm">
                    {localize("Post an ad")}
                  </Link>
                  <Link to={getMyAdvertsPath(user?.id)} className="btn-secondary !py-2 !text-sm">
                    {localize("Manage ads")}
                  </Link>
                </div>
              </div>

              <Link
                to="/profile/feedback"
                className="mt-6 flex flex-wrap items-center gap-3 border-t border-hairline pt-5 hover:text-teal"
              >
                {feedbackError ? (
                  <span className="font-sans text-sm text-red-700">{feedbackError}</span>
                ) : summary && summary.reviewCount > 0 ? (
                  <>
                    <StarRating rating={Number(summary.averageRating)} size="md" />
                    <span className="font-sans text-sm font-medium text-ink">
                      {summary.averageRating} · {summary.reviewCount}{" "}
                      {summary.reviewCount === 1 ? localize("review") : localize("reviews")}
                    </span>
                  </>
                ) : (
                  <span className="font-sans text-sm text-muted">{localize("No feedback yet")}</span>
                )}
              </Link>
            </section>

            <section className="mt-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">{localize("My adverts")}</h2>
                  <p className="mt-1 font-sans text-sm text-muted">
                    {activeListings.length} {localize("active")} {activeListings.length === 1 ? localize("ad") : localize("ads")}
                  </p>
                </div>
                <Link to={getMyAdvertsPath(user?.id)} className="font-sans text-sm font-medium text-teal-dark hover:underline">
                  {localize("View all ads")}
                </Link>
              </div>

              {isLoading && <p className="rounded-lg bg-white p-5 font-sans text-sm text-muted">{localize("Loading shop…")}</p>}
              {error && <p role="alert" className="rounded-lg bg-white p-5 font-sans text-sm text-red-700">{error}</p>}

              {!isLoading && !error && activeListings.length === 0 && (
                <div className="rounded-lg border border-hairline bg-white px-5 py-12 text-center">
                  <p className="font-sans text-sm text-ink">{localize("You don’t have active adverts now.")}</p>
                  <Link to="/listings/new" className="btn-primary mt-4 inline-flex !py-2 !text-sm">
                    {localize("Post your first ad")}
                  </Link>
                </div>
              )}

              {!isLoading && !error && activeListings.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {activeListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
