import { api } from "./api";
import { Category } from "../types/category.types";

export async function fetchCategories(): Promise<Category[]> {
  const response = await api.get("/categories");
  return response.data.data as Category[];
}

// --- Admin ---

export interface CategoryInput {
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
}

export async function createCategoryAdmin(input: CategoryInput): Promise<Category> {
  const response = await api.post("/categories", input);
  return response.data.data as Category;
}

export async function updateCategoryAdmin(
  id: string,
  input: Partial<CategoryInput> & { isActive?: boolean }
): Promise<Category> {
  const response = await api.patch(`/categories/${id}`, input);
  return response.data.data as Category;
}

export async function deleteCategoryAdmin(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

export async function fetchCategoriesAdmin(): Promise<Category[]> {
  const response = await api.get("/categories/admin/all");
  return response.data.data as Category[];
}

export async function reactivateCategoryAdmin(id: string): Promise<void> {
  await api.post(`/categories/admin/${id}/reactivate`);
}