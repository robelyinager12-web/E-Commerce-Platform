import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchReportsAdmin, resolveReportAdmin } from "../../services/listingReport.service";
import { ListingReport } from "../../types/listingReport.types";
import { getErrorMessage } from "../../utils/getErrorMessage";

export function AdminReports() {
  const [reports, setReports] = useState<ListingReport[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    fetchReportsAdmin(statusFilter || undefined)
      .then(({ items }) => setReports(items))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [statusFilter]);

  useEffect(load, [load]);

  async function handleResolve(id: string, action: "dismiss" | "remove_listing") {
    setPendingId(id);
    try {
      await resolveReportAdmin(id, action);
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
        <h1 className="font-display text-2xl font-semibold text-ink">Reports</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-48 !py-2 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
          <option value="">All</option>
        </select>
      </div>

      {error && <p className="mb-4 font-sans text-sm text-red-700">{error}</p>}

      {isLoading ? (
        <p className="font-sans text-sm text-muted">Loading…</p>
      ) : reports.length === 0 ? (
        <p className="font-sans text-sm text-muted">No reports match this filter.</p>
      ) : (
        <div className="card divide-y divide-hairline">
          {reports.map((report) => (
            <div key={report.id} className="flex items-start justify-between gap-4 px-5 py-4">
              <div>
                <Link to={`/listings/${report.listing_id}`} className="font-sans text-sm font-medium text-ink hover:text-teal">
                  {report.listing_title}
                </Link>
                <p className="mt-1 font-sans text-xs text-muted">
                  Reported by {report.reporter_name} · {report.reason}
                </p>
                {report.details && <p className="mt-1 font-sans text-xs text-ink/70">{report.details}</p>}
              </div>
              {report.status === "pending" && (
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleResolve(report.id, "remove_listing")}
                    disabled={pendingId === report.id}
                    className="btn-secondary !py-1.5 !text-xs"
                  >
                    Remove listing
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResolve(report.id, "dismiss")}
                    disabled={pendingId === report.id}
                    className="font-sans text-xs text-muted hover:text-ink"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}