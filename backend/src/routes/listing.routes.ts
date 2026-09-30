import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createListingValidator,
  updateListingValidator,
  listingIdParamValidator,
  listListingsValidator,
  adminListingStatusValidator,
} from "../validators/listing.validator";
import { createReportValidator } from "../validators/listingReport.validator";
import {
  getListings,
  getListing,
  getContact,
  postListing,
  patchListing,
  removeListing,
  getMyListings,
  getListingsAdmin,
  patchListingStatusAdmin,
} from "../controllers/listing.controller";
import { postListingReport } from "../controllers/listingReport.controller";

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many contact requests, please try again later." },
});

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many reports submitted, please try again later." },
});

// --- Public ---
router.get("/", listListingsValidator, validate, getListings);

// --- Authenticated: fixed-segment routes must come before "/:slug" ---
router.get("/mine", authenticate, getMyListings);

router.get(
  "/admin/all",
  authenticate,
  requireRole("super_admin", "admin", "staff"),
  getListingsAdmin
);

router.patch(
  "/admin/:id/status",
  authenticate,
  requireRole("super_admin", "admin", "staff"),
  adminListingStatusValidator,
  validate,
  patchListingStatusAdmin
);

router.get("/:slug", getListing);

router.get(
  "/:id/contact",
  authenticate,
  contactLimiter,
  listingIdParamValidator,
  validate,
  getContact
);

router.post(
  "/:id/report",
  authenticate,
  reportLimiter,
  createReportValidator,
  validate,
  postListingReport
);

router.post("/", authenticate, createListingValidator, validate, postListing);

router.patch("/:id", authenticate, updateListingValidator, validate, patchListing);

router.delete("/:id", authenticate, listingIdParamValidator, validate, removeListing);

export default router;