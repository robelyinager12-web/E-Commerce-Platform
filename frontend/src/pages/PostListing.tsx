import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createListing } from "../services/listing.service";
import { fetchCategories } from "../services/category.service";
import { Category } from "../types/category.types";
import { ListingForm } from "../components/listing/ListingForm";
import { getErrorMessage } from "../utils/getErrorMessage";

export function PostListing() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  async function handleSubmit(values: Parameters<typeof createListing>[0]) {
    setError(null);
    setIsSubmitting(true);
    try {
      const listing = await createListing(values);
      navigate(`/listings/${listing.slug}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink">Post a new ad</h1>
      {error && <p className="mb-4 font-sans text-sm text-red-700">{error}</p>}
      <ListingForm categories={categories} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}