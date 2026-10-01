import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyListings, removeListing, updateListing } from "../services/listing.service";
import { ListingListItem } from "../types/listing.types";
import { getErrorMessage } from "../utils/getErrorMessage";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-teal-light text-teal-dark",
  sold: "bg-gold-light text-gold-dark",
  expired: "bg-hairline text-ink/60",
  removed: "bg-red-50 text-red-700",
};

export function MyListings() {
  const [listings, setListings] = useState<ListingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  function load() {
    fetchMyListings()
      .then(setListings)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  async function handleMarkSold(id: string) {
    setPendingId(id);
    try {
      await updateListing(id, { status: "sold" });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this listing permanently?")) return;
    setPendingId(id);
    try {
      await removeListing(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">Your listings</h1>
        <Link to="/listings/new" className="btn-primary !py-2 !text-sm">
          + Post ad
        </Link>
      </div>

      {isLoading && <p className="font-sans text-sm text-muted">Loading…</p>}
      {error && <p className="font-sans text-sm text-red-700">{error}</p>}

      {!isLoading && listings.length === 0 && (
        <p className="font-sans text-sm text-muted">You haven't posted anything yet.</p>
      )}

      {!isLoading && listings.length > 0 && (
        <div className="card divide-y divide-hairline">
          {listings.map((listing) => (
            <div key={listing.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <Link to={`/listings/${listing.slug}`} className="flex-1">
                <p className="font-sans text-sm font-medium text-ink hover:text-teal">{listing.title}</p>
                <p className="price-tag mt-1 text-sm">{Number(listing.price).toLocaleString()} Br</p>
              </Link>
              <span
                className={`rounded-sm px-2 py-1 font-mono text-xs uppercase ${
                  STATUS_STYLES[listing.status] ?? "bg-hairline text-ink/60"
                }`}
              >
                {listing.status}
              </span>
              <div className="flex gap-3">
                <Link to={`/listings/${listing.slug}/edit`} className="font-sans text-xs text-teal hover:underline">
                  Edit
                </Link>
                {listing.status === "active" && (
                  <button
                    type="button"
                    onClick={() => handleMarkSold(listing.id)}
                    disabled={pendingId === listing.id}
                    className="font-sans text-xs text-gold-dark hover:underline disabled:opacity-50"
                  >
                    Mark sold
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(listing.id)}
                  disabled={pendingId === listing.id}
                  className="font-sans text-xs text-muted hover:text-red-700 disabled:opacity-50"
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