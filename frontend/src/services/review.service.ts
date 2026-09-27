import { api } from "./api";
import { Review } from "../types/review.types";
import { PaginationMeta } from "../types/product.types";

interface ReviewListResponse {
  items: Review[];
  meta: PaginationMeta;
}

export async function fetchProductReviews(
  productId: string,
  page = 1
): Promise<ReviewListResponse> {
  const response = await api.get(`/reviews/products/${productId}`, { params: { page } });
  return response.data.data as ReviewListResponse;
}

export async function submitReview(
  productId: string,
  input: { rating: number; comment?: string }
): Promise<Review> {
  const response = await api.post(`/reviews/products/${productId}`, input);
  return response.data.data as Review;
}