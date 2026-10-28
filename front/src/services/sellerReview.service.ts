import { api } from "./api";
import { SellerReview, SellerRatingSummary } from "../types/sellerReview.types";
import { PaginationMeta } from "../types/listing.types";

interface SellerReviewsResponse {
  items: SellerReview[];
  meta: PaginationMeta;
  summary: SellerRatingSummary;
}

export async function fetchSellerReviews(
  sellerId: string,
  page = 1
): Promise<SellerReviewsResponse> {
  const response = await api.get(`/sellers/${sellerId}/reviews`, { params: { page } });
  return response.data.data as SellerReviewsResponse;
}

export async function submitSellerReview(
  sellerId: string,
  input: { rating: number; comment?: string }
): Promise<SellerReview> {
  const response = await api.post(`/sellers/${sellerId}/reviews`, input);
  return response.data.data as SellerReview;
}

export async function deleteSellerReview(sellerId: string): Promise<void> {
  await api.delete(`/sellers/${sellerId}/reviews`);
}