import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  addSavedListingValidator,
  savedListingIdParamValidator,
} from "../validators/savedListing.validator";
import {
  getSavedListings,
  postSavedListing,
  deleteSavedListing,
} from "../controllers/savedListing.controller";

const router = Router();

router.use(authenticate);

router.get("/", getSavedListings);
router.post("/", addSavedListingValidator, validate, postSavedListing);
router.delete("/:listingId", savedListingIdParamValidator, validate, deleteSavedListing);

export default router;