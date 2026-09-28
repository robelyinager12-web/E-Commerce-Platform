import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import {
  listSavedListings,
  saveListing,
  unsaveListing,
} from "../services/savedListing.service";

export const getSavedListings = asyncHandler(async (req: Request, res: Response) => {
  const items = await listSavedListings(req.user!.userId);
  sendSuccess(res, "Saved listings retrieved", items);
});

export const postSavedListing = asyncHandler(async (req: Request, res: Response) => {
  const items = await saveListing(req.user!.userId, req.body.listingId);
  sendSuccess(res, "Listing saved", items, 201);
});

export const deleteSavedListing = asyncHandler(async (req: Request, res: Response) => {
  const items = await unsaveListing(req.user!.userId, req.params.listingId);
  sendSuccess(res, "Listing removed from saved", items);
});