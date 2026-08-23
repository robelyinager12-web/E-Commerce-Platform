import { body, param } from "express-validator";

export const addCartItemValidator = [
  body("productId").isUUID().withMessage("productId must be a valid UUID"),
  body("variantId").optional().isUUID().withMessage("variantId must be a valid UUID"),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("quantity must be a positive integer"),
];

export const updateCartItemValidator = [
  param("itemId").isUUID().withMessage("Invalid cart item id"),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("quantity must be a positive integer"),
];

export const cartItemIdParamValidator = [
  param("itemId").isUUID().withMessage("Invalid cart item id"),
];