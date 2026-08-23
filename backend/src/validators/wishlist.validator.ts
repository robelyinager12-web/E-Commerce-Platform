import { body, param } from "express-validator";

export const addWishlistItemValidator = [
  body("productId").isUUID().withMessage("productId must be a valid UUID"),
];

export const productIdParamValidator = [
  param("productId").isUUID().withMessage("Invalid product id"),
];