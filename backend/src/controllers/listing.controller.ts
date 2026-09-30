import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import {
  listListings,
  getListingBySlug,
  getSellerContact,
  incrementListingViews,
  createListing,
  updateListing,
  deleteListing,
  listMyListings,
  ListListingsFilters,
} from "../services/listing.service";

export const getListings = asyncHandler(async (req: Request, res: Response) => {
  const filters: ListListingsFilters = {
    category: req.query.category as string | undefined,
    search: req.query.search as string | undefined,
    region: req.query.region as string | undefined,
    city: req.query.city as string | undefined,
    minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
    maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
    condition: req.query.condition as ListListingsFilters["condition"],
    sort: req.query.sort as ListListingsFilters["sort"],
  };
  const { items, meta } = await listListings(req.query as Record<string, unknown>, filters);
  sendSuccess(res, "Listings retrieved", { items, meta });
});

export const getListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await getListingBySlug(req.params.slug);
  incrementListingViews(listing.id).catch(() => {});
  sendSuccess(res, "Listing retrieved", listing);
});

export const getContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await getSellerContact(req.params.id);
  sendSuccess(res, "Seller contact retrieved", contact);
});

export const postListing = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, price, condition, region, city, categoryId, imageUrl } = req.body;
  const listing = await createListing(req.user!.userId, {
    title,
    description,
    price,
    condition,
    region,
    city,
    categoryId,
    imageUrl,
  });
  sendSuccess(res, "Listing created successfully", listing, 201);
});

export const patchListing = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, price, condition, region, city, categoryId, status } = req.body;
  const listing = await updateListing(req.user!.userId, req.params.id, {
    title,
    description,
    price,
    condition,
    region,
    city,
    categoryId,
    status,
  });
  sendSuccess(res, "Listing updated successfully", listing);
});

export const removeListing = asyncHandler(async (req: Request, res: Response) => {
  await deleteListing(req.user!.userId, req.params.id);
  sendSuccess(res, "Listing removed successfully");
});

export const getMyListings = asyncHandler(async (req: Request, res: Response) => {
  const listings = await listMyListings(req.user!.userId);
  sendSuccess(res, "Your listings retrieved", listings);
});
import { listListingsAdmin, adminSetListingStatus } from "../services/listing.service";
import { logAudit } from "../utils/audit.util";

export const getListingsAdmin = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    status: req.query.status as "active" | "sold" | "expired" | "removed" | undefined,
    search: req.query.search as string | undefined,
  };
  const { items, meta } = await listListingsAdmin(req.query as Record<string, unknown>, filters);
  sendSuccess(res, "Listings retrieved", { items, meta });
});

export const patchListingStatusAdmin = asyncHandler(async (req: Request, res: Response) => {
  await adminSetListingStatus(req.params.id, req.body.status);
  await logAudit({
    userId: req.user!.userId,
    action: "ADMIN_LISTING_STATUS_CHANGED",
    entityType: "listing",
    entityId: req.params.id,
    metadata: { newStatus: req.body.status },
  });
  sendSuccess(res, "Listing status updated");
});