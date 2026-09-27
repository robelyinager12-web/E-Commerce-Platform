import { Router } from "express";
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
  postListing,
  patchListing,
  removeListing,
  getMyListings,
} from "../controllers/listing.controller";

const router = Router();

// --- Public ---
router.get("/", listListingsValidator, validate, getListings);

// --- Authenticated: "my listings" must come before "/:slug" to avoid collision ---
router.get("/mine", authenticate, getMyListings);

router.get("/:slug", getListing);

router.post("/", authenticate, createListingValidator, validate, postListing);

router.patch(
  "/:id",
  authenticate,
  updateListingValidator,
  validate,
  patchListing
);

router.delete("/:id", authenticate, listingIdParamValidator, validate, removeListing);

export default router;