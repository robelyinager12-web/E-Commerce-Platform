export interface SavedListingItem {
  id: string;
  listing_id: string;
  title: string;
  slug: string;
  price: string;
  region: string;
  city: string;
  status: string;
  primary_image: string | null;
  saved_at: string;
}