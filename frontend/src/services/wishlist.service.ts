import { api } from "./api";
import { WishlistItem } from "../types/wishlist.types";

export async function fetchWishlist(): Promise<WishlistItem[]> {
  const response = await api.get("/wishlist");
  return response.data.data as WishlistItem[];
}

export async function addToWishlist(productId: string): Promise<WishlistItem[]> {
  const response = await api.post("/wishlist", { productId });
  return response.data.data as WishlistItem[];
}

export async function removeFromWishlist(productId: string): Promise<WishlistItem[]> {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data.data as WishlistItem[];
}