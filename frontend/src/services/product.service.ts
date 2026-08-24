import { api, ApiResponse } from "./api";
import { ProductListItem, PaginationMeta } from "../types/product.types";

export async function fetchProducts(params?: {
  limit?: number;
  category?: string;
}): Promise<{ items: ProductListItem[]; meta: PaginationMeta }> {
  const response = await api.get<ApiResponse<{ items: ProductListItem[]; meta: PaginationMeta }>>(
    "/products",
    { params }
  );
  return response.data.data;
}