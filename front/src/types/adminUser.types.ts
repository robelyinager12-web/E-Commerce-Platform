export interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: "super_admin" | "admin" | "staff" | "customer";
  is_active: boolean;
  created_at: string;
  listing_count: string;
}