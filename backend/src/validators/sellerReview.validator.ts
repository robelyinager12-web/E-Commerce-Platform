import { body, param, query } from "express-validator";

export const sellerIdParamValidator = [
  param("sellerId").isUUID().withMessage("Invalid seller id"),
];

export const listSellerReviewsValidator = [
  param("sellerId").isUUID().withMessage("Invalid seller id"),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

export const createSellerReviewValidator = [
  param("sellerId").isUUID().withMessage("Invalid seller id"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("rating must be an integer between 1 and 5"),
  body("comment").optional().isString().trim().isLength({ max: 2000 }),
];