import { body, param, query } from "express-validator";

export const productIdParamValidator = [
  param("productId").isUUID().withMessage("Invalid product id"),
];

export const createReviewValidator = [
  param("productId").isUUID().withMessage("Invalid product id"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("rating must be an integer between 1 and 5"),
  body("comment").optional().isString().trim().isLength({ max: 2000 }),
];

export const updateReviewValidator = [
  param("id").isUUID().withMessage("Invalid review id"),
  body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("rating must be between 1 and 5"),
  body("comment").optional().isString().trim().isLength({ max: 2000 }),
];

export const reviewIdParamValidator = [param("id").isUUID().withMessage("Invalid review id")];

export const listReviewsValidator = [
  param("productId").isUUID().withMessage("Invalid product id"),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];