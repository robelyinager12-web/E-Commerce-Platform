export interface SellerReview {
  id: string;
  seller_id: string;
  reviewer_id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface SellerRatingSummary {
  averageRating: string;
  reviewCount: number;
}