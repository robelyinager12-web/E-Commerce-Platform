import { api, ApiResponse } from "./api";
import { Review } from "../types/review.types";
import { PaginationMeta } from "../types/product.types";

export async function fetchProductReviews(
  productId: string,
  page = 1
): Promise<{ items: Review[]; meta: PaginationMeta }> {
  const response = await api.get<ApiResponse<{ items: Review[]; meta: PaginationMeta }>>(
    `/reviews/products/${productId}`,
    { params: { page } }
  );
  return response.data.data;
}

export async function submitReview(
  productId: string,
  input: { rating: number; comment?: string }
): Promise<Review> {
  const response = await api.post<ApiResponse<Review>>(`/reviews/products/${productId}`, input);
  return response.data.data;
}