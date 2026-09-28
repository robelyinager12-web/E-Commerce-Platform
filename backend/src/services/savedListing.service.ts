import { query } from "../config/database";
import { ApiError } from "../utils/apiError.util";

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

export async function listSavedListings(userId: string): Promise<SavedListingItem[]> {
  const result = await query(
    `SELECT
       s.id, s.listing_id, l.title, l.slug, l.price::text, l.region, l.city, l.status,
       (SELECT image_url FROM listing_images WHERE listing_id = l.id AND is_primary = true LIMIT 1) as primary_image,
       s.created_at as saved_at
     FROM saved_listings s
     JOIN listings l ON l.id = s.listing_id
     WHERE s.user_id = $1
     ORDER BY s.created_at DESC`,
    [userId]
  );
  return result.rows as SavedListingItem[];
}

export async function saveListing(userId: string, listingId: string): Promise<SavedListingItem[]> {
  const listing = await query("SELECT id FROM listings WHERE id = $1 AND status = 'active'", [
    listingId,
  ]);
  if ((listing.rows as unknown[]).length === 0) {
    throw ApiError.notFound("Listing not found");
  }

  await query(
    `INSERT INTO saved_listings (user_id, listing_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, listing_id) DO NOTHING`,
    [userId, listingId]
  );

  return listSavedListings(userId);
}

export async function unsaveListing(userId: string, listingId: string): Promise<SavedListingItem[]> {
  const result = await query(
    "DELETE FROM saved_listings WHERE user_id = $1 AND listing_id = $2",
    [userId, listingId]
  );
  if (result.rowCount === 0) {
    throw ApiError.notFound("This listing isn't in your saved list");
  }
  return listSavedListings(userId);
}