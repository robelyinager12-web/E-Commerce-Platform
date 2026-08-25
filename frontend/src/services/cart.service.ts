import { api, ApiResponse } from "./api";
import { Cart } from "../types/cart.types";

export async function fetchCart(): Promise<Cart> {
  const response = await api.get<ApiResponse<Cart>>("/cart");
  return response.data.data;
}

export async function addCartItem(input: {
  productId: string;
  variantId?: string;
  quantity: number;
}): Promise<Cart> {
  const response = await api.post<ApiResponse<Cart>>("/cart/items", input);
  return response.data.data;
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  const response = await api.patch<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity });
  return response.data.data;
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const response = await api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
  return response.data.data;
}

export async function clearCart(): Promise<Cart> {
  const response = await api.delete<ApiResponse<Cart>>("/cart");
  return response.data.data;
}