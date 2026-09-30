import { body, param, query } from "express-validator";

export const createListingValidator = [
  body("title").trim().notEmpty().withMessage("title is required").isLength({ max: 255 }),
  body("description").optional().isString().trim(),
  body("price").isFloat({ min: 0 }).withMessage("price must be a non-negative number"),
  body("condition").isIn(["new", "used"]).withMessage("condition must be 'new' or 'used'"),
  body("region").trim().notEmpty().withMessage("region is required"),
  body("city").trim().notEmpty().withMessage("city is required"),
  body("categoryId").isUUID().withMessage("categoryId must be a valid UUID"),
  body("imageUrl").optional().isURL().withMessage("imageUrl must be a valid URL"),
];

export const updateListingValidator = [
  param("id").isUUID().withMessage("Invalid listing id"),
  body("title").optional().trim().isLength({ max: 255 }),
  body("description").optional().isString().trim(),
  body("price").optional().isFloat({ min: 0 }),
  body("condition").optional().isIn(["new", "used"]),
  body("region").optional().trim().notEmpty(),
  body("city").optional().trim().notEmpty(),
  body("categoryId").optional().isUUID(),
  body("status").optional().isIn(["active", "sold", "expired", "removed"]),
];

export const listingIdParamValidator = [param("id").isUUID().withMessage("Invalid listing id")];

export const listListingsValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("category").optional().isString().trim(),
  query("search").optional().isString().trim(),
  query("region").optional().isString().trim(),
  query("city").optional().isString().trim(),
  query("minPrice").optional().isFloat({ min: 0 }),
  query("maxPrice").optional().isFloat({ min: 0 }),
  query("condition").optional().isIn(["new", "used"]),
  query("sort").optional().isIn(["newest", "price_asc", "price_desc"]),
];
export const adminListingStatusValidator = [
  param("id").isUUID().withMessage("Invalid listing id"),
  body("status").isIn(["active", "sold", "expired", "removed"]).withMessage("Invalid status"),
];