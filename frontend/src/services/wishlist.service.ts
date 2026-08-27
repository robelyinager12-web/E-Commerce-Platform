import { api, ApiResponse } from "./api";
import { WishlistItem } from "../types/wishlist.types";

export async function fetchWishlist(): Promise<WishlistItem[]> {
  const response = await api.get<ApiResponse<WishlistItem[]>>("/wishlist");
  return response.data.data;
}

export async function addToWishlist(productId: string): Promise<WishlistItem[]> {
  const response = await api.post<ApiResponse<WishlistItem[]>>("/wishlist", { productId });
  return response.data.data;
}

export async function removeFromWishlist(productId: string): Promise<WishlistItem[]> {
  const response = await api.delete<ApiResponse<WishlistItem[]>>(`/wishlist/${productId}`);
  return response.data.data;
}