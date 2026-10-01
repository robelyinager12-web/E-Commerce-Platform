export interface ListingImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface ListingListItem {
  id: string;
  title: string;
  slug: string;
  price: string;
  condition: "new" | "used";
  region: string;
  city: string;
  status: "active" | "sold" | "expired" | "removed";
  created_at: string;
  primary_image: string | null;
}

export interface ListingDetail extends ListingListItem {
  description: string | null;
  views_count: number;
  updated_at: string;
  category: { id: string; name: string; slug: string };
  images: ListingImage[];
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    memberSince: string;
    averageRating: string;
    reviewCount: number;
  };
}

export interface SellerContact {
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ListingListParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  region?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: "new" | "used";
  sort?: "newest" | "price_asc" | "price_desc";
}

export interface CreateListingInput {
  title: string;
  description?: string;
  price: number;
  condition: "new" | "used";
  region: string;
  city: string;
  categoryId: string;
  imageUrl?: string;
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  price?: number;
  condition?: "new" | "used";
  region?: string;
  city?: string;
  categoryId?: string;
  status?: "active" | "sold" | "expired" | "removed";
}