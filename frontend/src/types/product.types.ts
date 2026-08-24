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

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}