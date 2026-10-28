import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchListingBySlug, updateListing } from "../services/listing.service";
import { fetchCategories } from "../services/category.service";
import { Category } from "../types/category.types";
import { ListingDetail } from "../types/listing.types";
import { ListingForm } from "../components/listing/ListingForm";
import { getErrorMessage } from "../utils/getErrorMessage";

export function EditListing() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    Promise.all([fetchListingBySlug(slug), fetchCategories()])
      .then(([listingData, cats]) => {
        setListing(listingData);
        setCategories(cats);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [slug]);

  async function handleSubmit(values: Parameters<typeof updateListing>[1]) {
    if (!listing) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await updateListing(listing.id, values);
      navigate(`/listings/${updated.slug}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="mx-auto max-w-2xl px-6 py-16 font-sans text-sm text-muted">Loading…</div>;
  }

  if (error && !listing) {
    return <div className="mx-auto max-w-2xl px-6 py-16 font-sans text-sm text-red-700">{error}</div>;
  }

  if (!listing) return null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink">Edit listing</h1>
      {error && <p className="mb-4 font-sans text-sm text-red-700">{error}</p>}
      <ListingForm existing={listing} categories={categories} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}