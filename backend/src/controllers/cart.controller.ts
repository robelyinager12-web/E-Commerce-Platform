import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import { ApiError } from "../utils/apiError.util";
import {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from "../services/cart.service";

function ownerFrom(req: Request) {
  if (!req.cartOwner) {
    throw ApiError.internal("Cart owner was not resolved");
  }
  return req.cartOwner;
}

export const getMyCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await getCart(ownerFrom(req));
  sendSuccess(res, "Cart retrieved", cart);
});

export const addCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { productId, variantId, quantity } = req.body;
  const cart = await addItemToCart(ownerFrom(req), { productId, variantId, quantity });
  sendSuccess(res, "Item added to cart", cart, 201);
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { quantity } = req.body;
  const cart = await updateCartItemQuantity(ownerFrom(req), req.params.itemId, quantity);
  sendSuccess(res, "Cart item updated", cart);
});

export const deleteCartItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await removeCartItem(ownerFrom(req), req.params.itemId);
  sendSuccess(res, "Item removed from cart", cart);
});

export const deleteCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await clearCart(ownerFrom(req));
  sendSuccess(res, "Cart cleared", cart);
});