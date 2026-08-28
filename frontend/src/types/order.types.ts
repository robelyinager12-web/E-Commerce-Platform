export interface AddressInput {
  label?: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  product_name_snapshot: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface OrderStatusHistoryEntry {
  status: string;
  note: string | null;
  created_at: string;
}

export interface OrderSummary {
  id: string;
  order_number: string;
  status: string;
  subtotal: string;
  discount_amount: string;
  shipping_cost: string;
  tax_amount: string;
  total_amount: string;
  created_at: string;
}

export interface OrderDetail extends OrderSummary {
  items: OrderItem[];
  shipping_address: AddressInput & { id: string };
  billing_address: AddressInput & { id: string };
  status_history: OrderStatusHistoryEntry[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}