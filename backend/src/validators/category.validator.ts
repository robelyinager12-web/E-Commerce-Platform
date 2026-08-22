import { body, param } from "express-validator";

export const createCategoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ max: 150 })
    .withMessage("Category name must be 150 characters or fewer"),
  body("description").optional().isString().trim(),
  body("imageUrl").optional().isURL().withMessage("imageUrl must be a valid URL"),
  body("parentId").optional().isUUID().withMessage("parentId must be a valid UUID"),
];

export const updateCategoryValidator = [
  param("id").isUUID().withMessage("Invalid category id"),
  body("name").optional().trim().isLength({ max: 150 }),
  body("description").optional().isString().trim(),
  body("imageUrl").optional().isURL().withMessage("imageUrl must be a valid URL"),
  body("parentId").optional({ nullable: true }).isUUID().withMessage("parentId must be a valid UUID"),
  body("isActive").optional().isBoolean(),
];

export const categoryIdParamValidator = [param("id").isUUID().withMessage("Invalid category id")];