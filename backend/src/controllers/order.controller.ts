import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import {
  checkout,
  getOrderForUser,
  getOrderDetail,
  listUserOrders,
  listAllOrders,
  updateOrderStatus,
} from "../services/order.service";

export const postCheckout = asyncHandler(async (req: Request, res: Response) => {
  const { shippingAddress, billingAddress, couponCode } = req.body;
  const order = await checkout(req.user!.userId, { shippingAddress, billingAddress, couponCode });
  sendSuccess(res, "Order placed successfully", order, 201);
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const { items, meta } = await listUserOrders(
    req.user!.userId,
    req.query as Record<string, unknown>,
    req.query.status as string | undefined
  );
  sendSuccess(res, "Orders retrieved", { items, meta });
});

export const getMyOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await getOrderForUser(req.params.id, req.user!.userId);
  sendSuccess(res, "Order retrieved", order);
});

// --- Admin ---

export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { items, meta } = await listAllOrders(
    req.query as Record<string, unknown>,
    req.query.status as string | undefined
  );
  sendSuccess(res, "Orders retrieved", { items, meta });
});

export const getAnyOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await getOrderDetail(req.params.id);
  sendSuccess(res, "Order retrieved", order);
});

export const patchOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, note } = req.body;
  const order = await updateOrderStatus(req.params.id, status, note, req.user!.userId);
  sendSuccess(res, "Order status updated", order);
});