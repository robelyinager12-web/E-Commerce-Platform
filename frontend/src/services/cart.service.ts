import { api } from "./api";
import { Cart } from "../types/cart.types";

export async function fetchCart(): Promise<Cart> {
  const response = await api.get("/cart");
  return response.data.data as Cart;
}

export async function addCartItem(input: {
  productId: string;
  variantId?: string;
  quantity: number;
}): Promise<Cart> {
  const response = await api.post("/cart/items", input);
  return response.data.data as Cart;
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  const response = await api.patch(`/cart/items/${itemId}`, { quantity });
  return response.data.data as Cart;
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const response = await api.delete(`/cart/items/${itemId}`);
  return response.data.data as Cart;
}

export async function clearCart(): Promise<Cart> {
  const response = await api.delete("/cart");
  return response.data.data as Cart;
}