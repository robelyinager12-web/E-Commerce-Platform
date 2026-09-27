import { api } from "./api";
import { ProductListItem, ProductDetail, PaginationMeta, ProductListParams } from "../types/product.types";

interface ProductListResponse {
  items: ProductListItem[];
  meta: PaginationMeta;
}

export async function fetchProducts(params?: ProductListParams): Promise<ProductListResponse> {
  const response = await api.get("/products", { params });
  return response.data.data as ProductListResponse;
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail> {
  const response = await api.get(`/products/${slug}`);
  return response.data.data as ProductDetail;
}

// --- Admin ---

export interface CreateProductInput {
  name: string;
  description?: string;
  basePrice: number;
  sku: string;
  stockQuantity?: number;
  categoryIds?: string[];
  imageUrl?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  basePrice?: number;
  stockQuantity?: number;
  isActive?: boolean;
  categoryIds?: string[];
}

export async function createProductAdmin(input: CreateProductInput): Promise<ProductDetail> {
  const response = await api.post("/products", input);
  return response.data.data as ProductDetail;
}

export async function updateProductAdmin(
  id: string,
  input: UpdateProductInput
): Promise<ProductDetail> {
  const response = await api.patch(`/products/${id}`, input);
  return response.data.data as ProductDetail;
}

export async function deactivateProductAdmin(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export interface ProductListItemAdmin extends ProductListItem {
  is_active: boolean;
}

interface ProductListAdminResponse {
  items: ProductListItemAdmin[];
  meta: PaginationMeta;
}

export async function fetchProductsAdmin(params?: {
  search?: string;
  isActive?: boolean;
}): Promise<ProductListAdminResponse> {
  const response = await api.get("/products/admin/all", { params });
  return response.data.data as ProductListAdminResponse;
}

export async function reactivateProductAdmin(id: string): Promise<void> {
  await api.post(`/products/admin/${id}/reactivate`);
}