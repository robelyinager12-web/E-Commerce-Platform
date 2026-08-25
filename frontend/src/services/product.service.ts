import { api, ApiResponse } from "./api";
import { ProductListItem, ProductDetail, PaginationMeta, ProductListParams } from "../types/product.types";

export async function fetchProducts(
  params?: ProductListParams
): Promise<{ items: ProductListItem[]; meta: PaginationMeta }> {
  const response = await api.get<ApiResponse<{ items: ProductListItem[]; meta: PaginationMeta }>>(
    "/products",
    { params }
  );
  return response.data.data;
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail> {
  const response = await api.get<ApiResponse<ProductDetail>>(`/products/${slug}`);
  return response.data.data;
}