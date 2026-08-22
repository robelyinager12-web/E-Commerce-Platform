import { body, param, query } from "express-validator";

export const createProductValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 255 })
    .withMessage("Product name must be 255 characters or fewer"),
  body("description").optional().isString().trim(),
  body("basePrice")
    .isFloat({ min: 0 })
    .withMessage("basePrice must be a non-negative number"),
  body("sku").trim().notEmpty().withMessage("sku is required"),
  body("stockQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("stockQuantity must be a non-negative integer"),
  body("categoryIds").optional().isArray().withMessage("categoryIds must be an array"),
  body("categoryIds.*").optional().isUUID().withMessage("Each categoryId must be a valid UUID"),
  body("imageUrl").optional().isURL().withMessage("imageUrl must be a valid URL"),
];

export const updateProductValidator = [
  param("id").isUUID().withMessage("Invalid product id"),
  body("name").optional().trim().isLength({ max: 255 }),
  body("description").optional().isString().trim(),
  body("basePrice").optional().isFloat({ min: 0 }),
  body("stockQuantity").optional().isInt({ min: 0 }),
  body("isActive").optional().isBoolean(),
  body("categoryIds").optional().isArray(),
  body("categoryIds.*").optional().isUUID(),
];

export const productIdParamValidator = [param("id").isUUID().withMessage("Invalid product id")];

export const listProductsValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("category").optional().isString().trim(),
  query("search").optional().isString().trim(),
  query("minPrice").optional().isFloat({ min: 0 }),
  query("maxPrice").optional().isFloat({ min: 0 }),
  query("sort").optional().isIn(["newest", "price_asc", "price_desc", "name_asc"]),
];