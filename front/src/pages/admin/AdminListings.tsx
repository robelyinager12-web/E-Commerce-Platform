import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchListingsAdmin, setListingStatusAdmin, ListingListItemAdmin } from "../../services/listing.service";
import { getErrorMessage } from "../../utils/getErrorMessage";

const STATUS_OPTIONS = ["active", "sold", "expired", "removed"];

export function AdminListings() {
  const [listings, setListings] = useState<ListingListItemAdmin[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    fetchListingsAdmin({ status: statusFilter || undefined })
      .then(({ items }) => setListings(items))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [statusFilter]);

  useEffect(load, [load]);

  async function handleStatusChange(id: string, status: string) {
    setPendingId(id);
    try {
      await setListingStatusAdmin(id, status);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Listings</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-48 !py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mb-4 font-sans text-sm text-red-700">{error}</p>}

      {isLoading ? (
        <p className="font-sans text-sm text-muted">Loading…</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full font-sans text-sm">
            <thead className="bg-white text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Change status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {listings.map((listing) => (
                <tr key={listing.id}>
                  <td className="px-4 py-3">
                    <Link to={`/listings/${listing.slug}`} className="text-ink hover:text-teal">
                      {listing.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink/80">{listing.seller_name}</td>
                  <td className="price-tag px-4 py-3">{Number(listing.price).toLocaleString()} Br</td>
                  <td className="px-4 py-3">
                    <span className="rounded-sm bg-hairline px-2 py-1 font-mono text-xs uppercase">
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      defaultValue=""
                      disabled={pendingId === listing.id}
                      onChange={(e) => {
                        if (e.target.value) handleStatusChange(listing.id, e.target.value);
                      }}
                      className="input-field !py-1.5 text-xs"
                    >
                      <option value="" disabled>
                        Move to…
                      </option>
                      {STATUS_OPTIONS.filter((s) => s !== listing.status).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}