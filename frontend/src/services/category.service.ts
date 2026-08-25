import { api, ApiResponse } from "./api";
import { Category } from "../types/category.types";

export async function fetchCategories(): Promise<Category[]> {
  const response = await api.get<ApiResponse<Category[]>>("/categories");
  return response.data.data;
}