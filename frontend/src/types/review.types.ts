export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  is_verified_purchase: boolean;
  created_at: string;
}