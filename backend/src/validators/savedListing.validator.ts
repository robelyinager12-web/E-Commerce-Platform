import { body, param } from "express-validator";

export const addSavedListingValidator = [
  body("listingId").isUUID().withMessage("listingId must be a valid UUID"),
];

export const savedListingIdParamValidator = [
  param("listingId").isUUID().withMessage("Invalid listing id"),
];