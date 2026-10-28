import { api } from "./api";
import { SavedListingItem } from "../types/savedListing.types";

export async function fetchSavedListings(): Promise<SavedListingItem[]> {
  const response = await api.get("/saved-listings");
  return response.data.data as SavedListingItem[];
}

export async function saveListing(listingId: string): Promise<SavedListingItem[]> {
  const response = await api.post("/saved-listings", { listingId });
  return response.data.data as SavedListingItem[];
}

export async function unsaveListing(listingId: string): Promise<SavedListingItem[]> {
  const response = await api.delete(`/saved-listings/${listingId}`);
  return response.data.data as SavedListingItem[];
}