export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  createdAt?: string;
  role: "super_admin" | "admin" | "staff" | "customer";
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}