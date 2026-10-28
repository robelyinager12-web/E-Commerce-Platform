export interface ListingReport {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_status: string;
  reporter_id: string;
  reporter_name: string;
  reason: string;
  details: string | null;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
}