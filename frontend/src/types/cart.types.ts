export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  product_slug: string;
  variant_name: string | null;
  variant_value: string | null;
  quantity: number;
  price_at_add: string;
  line_total: string;
  primary_image: string | null;
  available_stock: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: string;
  itemCount: number;
}