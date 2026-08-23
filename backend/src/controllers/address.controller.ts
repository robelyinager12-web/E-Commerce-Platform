import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import { listAddresses, createAddress, updateAddress, deleteAddress } from "../services/address.service";

export const getAddresses = asyncHandler(async (req: Request, res: Response) => {
  const addresses = await listAddresses(req.user!.userId);
  sendSuccess(res, "Addresses retrieved", addresses);
});

export const postAddress = asyncHandler(async (req: Request, res: Response) => {
  const { label, street, city, state, postalCode, country, isDefault } = req.body;
  const address = await createAddress(req.user!.userId, {
    label,
    street,
    city,
    state,
    postalCode,
    country,
    isDefault,
  });
  sendSuccess(res, "Address created successfully", address, 201);
});

export const patchAddress = asyncHandler(async (req: Request, res: Response) => {
  const { label, street, city, state, postalCode, country, isDefault } = req.body;
  const address = await updateAddress(req.user!.userId, req.params.id, {
    label,
    street,
    city,
    state,
    postalCode,
    country,
    isDefault,
  });
  sendSuccess(res, "Address updated successfully", address);
});

export const removeAddress = asyncHandler(async (req: Request, res: Response) => {
  await deleteAddress(req.user!.userId, req.params.id);
  sendSuccess(res, "Address deleted successfully");
});