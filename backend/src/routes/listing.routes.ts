import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createListingValidator,
  updateListingValidator,
  listingIdParamValidator,
  listListingsValidator,
} from "../validators/listing.validator";
import {
  getListings,
  getListing,
  getContact,
  postListing,
  patchListing,
  removeListing,
  getMyListings,
} from "../controllers/listing.controller";

const router = Router();

// Contact reveal is limited to slow down anyone trying to harvest phone numbers.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many contact requests, please try again later." },
});

// --- Public ---
router.get("/", listListingsValidator, validate, getListings);

// --- Authenticated: "/mine" must come before "/:slug" to avoid collision ---
router.get("/mine", authenticate, getMyListings);

router.get("/:slug", getListing);

router.get(
  "/:id/contact",
  authenticate,
  contactLimiter,
  listingIdParamValidator,
  validate,
  getContact
);

router.post("/", authenticate, createListingValidator, validate, postListing);

router.patch("/:id", authenticate, updateListingValidator, validate, patchListing);

router.delete("/:id", authenticate, listingIdParamValidator, validate, removeListing);

export default router;