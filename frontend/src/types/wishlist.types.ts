export interface WishlistItem {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  base_price: string;
  primary_image: string | null;
  is_active: boolean;
  added_at: string;
}