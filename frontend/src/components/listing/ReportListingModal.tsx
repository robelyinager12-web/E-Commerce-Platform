import { FormEvent, useState } from "react";
import { reportListing } from "../../services/listing.service";
import { getErrorMessage } from "../../utils/getErrorMessage";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "scam", label: "Scam or fraud" },
  { value: "prohibited_item", label: "Prohibited item" },
  { value: "duplicate", label: "Duplicate listing" },
  { value: "other", label: "Other" },
];

export function ReportListingModal({
  listingId,
  onClose,
}: {
  listingId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await reportListing(listingId, { reason, details: details || undefined });
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-sm rounded-sm bg-white p-6">
        {submitted ? (
          <>
            <p className="font-display text-lg font-semibold text-ink">Thanks for reporting</p>
            <p className="mt-2 font-sans text-sm text-muted">
              Our team will review this listing shortly.
            </p>
            <button type="button" onClick={onClose} className="btn-primary mt-5">
              Close
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="font-display text-lg font-semibold text-ink">Report this listing</p>
            <div className="mt-4">
              <label htmlFor="reason" className="mb-1.5 block font-sans text-sm font-medium text-ink">
                Reason
              </label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input-field"
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <label htmlFor="details" className="mb-1.5 block font-sans text-sm font-medium text-ink">
                Details (optional)
              </label>
              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                className="input-field"
              />
            </div>
            {error && <p className="mt-3 font-sans text-sm text-red-700">{error}</p>}
            <div className="mt-5 flex gap-3">
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit report"}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}