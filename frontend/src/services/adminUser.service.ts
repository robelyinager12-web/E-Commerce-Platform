import { api } from "./api";
import { AdminUser } from "../types/adminUser.types";
import { PaginationMeta } from "../types/listing.types";

interface AdminUsersResponse {
  items: AdminUser[];
  meta: PaginationMeta;
}

export async function fetchUsersAdmin(params?: {
  search?: string;
  role?: string;
  page?: number;
}): Promise<AdminUsersResponse> {
  const response = await api.get("/admin/users", { params });
  return response.data.data as AdminUsersResponse;
}

export async function updateUserAdmin(
  id: string,
  input: { isActive?: boolean; role?: string }
): Promise<void> {
  await api.patch(`/admin/users/${id}`, input);
}