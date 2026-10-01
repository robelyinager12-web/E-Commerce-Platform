import { Link } from "react-router-dom";
import { useSavedListings } from "../context/SavedListingsContext";

export function SavedListings() {
  const { saved, isLoading, toggleSave } = useSavedListings();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink">Saved listings</h1>

      {isLoading && <p className="font-sans text-sm text-muted">Loading…</p>}

      {!isLoading && saved.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-sans text-sm text-muted">Nothing saved here yet.</p>
          <Link to="/listings" className="btn-primary mt-6 inline-flex">
            Browse listings
          </Link>
        </div>
      )}

      {!isLoading && saved.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((item) => (
            <div key={item.id} className="card overflow-hidden">
              <Link to={`/listings/${item.slug}`} className="block aspect-square bg-teal-light">
                {item.primary_image && (
                  <img src={item.primary_image} alt={item.title} className="h-full w-full object-cover" />
                )}
              </Link>
              <div className="p-4">
                <Link to={`/listings/${item.slug}`} className="font-sans text-sm font-medium text-ink hover:text-teal line-clamp-2">
                  {item.title}
                </Link>
                <p className="price-tag mt-2 text-base">{Number(item.price).toLocaleString()} Br</p>
                <button
                  type="button"
                  onClick={() => toggleSave(item.listing_id)}
                  className="btn-secondary mt-3 w-full !py-2 !text-xs"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}