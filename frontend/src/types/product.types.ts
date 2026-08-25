export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  base_price: string;
  sku: string;
  stock_quantity: number;
  average_rating: string;
  primary_image: string | null;
}

export interface ProductVariant {
  id: string;
  variant_name: string;
  variant_value: string;
  price_adjustment: string;
  stock_quantity: number;
}

export interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface ProductCategoryRef {
  id: string;
  name: string;
  slug: string;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  is_active: boolean;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
  categories: ProductCategoryRef[];
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export type SortOption = "newest" | "price_asc" | "price_desc" | "name_asc";

export interface ProductListParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
}