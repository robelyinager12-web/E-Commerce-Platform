import { api } from "./api";
import {
  ListingListItem,
  ListingDetail,
  SellerContact,
  PaginationMeta,
  ListingListParams,
  CreateListingInput,
  UpdateListingInput,
} from "../types/listing.types";

interface ListingListResponse {
  items: ListingListItem[];
  meta: PaginationMeta;
}

export async function fetchListings(params?: ListingListParams): Promise<ListingListResponse> {
  const response = await api.get("/listings", { params });
  return response.data.data as ListingListResponse;
}

export async function fetchListingBySlug(slug: string): Promise<ListingDetail> {
  const response = await api.get(`/listings/${slug}`);
  return response.data.data as ListingDetail;
}

export async function fetchSellerContact(listingId: string): Promise<SellerContact> {
  const response = await api.get(`/listings/${listingId}/contact`);
  return response.data.data as SellerContact;
}

export async function fetchMyListings(): Promise<ListingListItem[]> {
  const response = await api.get("/listings/mine");
  return response.data.data as ListingListItem[];
}

export async function createListing(input: CreateListingInput): Promise<ListingDetail> {
  const response = await api.post("/listings", input);
  return response.data.data as ListingDetail;
}

export async function updateListing(id: string, input: UpdateListingInput): Promise<ListingDetail> {
  const response = await api.patch(`/listings/${id}`, input);
  return response.data.data as ListingDetail;
}

export async function removeListing(id: string): Promise<void> {
  await api.delete(`/listings/${id}`);
}

export async function reportListing(
  id: string,
  input: { reason: string; details?: string }
): Promise<void> {
  await api.post(`/listings/${id}/report`, input);
}

// --- Admin ---

export interface ListingListItemAdmin extends ListingListItem {
  seller_name: string;
}

interface ListingListAdminResponse {
  items: ListingListItemAdmin[];
  meta: PaginationMeta;
}

export async function fetchListingsAdmin(params?: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<ListingListAdminResponse> {
  const response = await api.get("/listings/admin/all", { params });
  return response.data.data as ListingListAdminResponse;
}

export async function setListingStatusAdmin(id: string, status: string): Promise<void> {
  await api.patch(`/listings/admin/${id}/status`, { status });
}