import { body, param } from "express-validator";

export const createAddressValidator = [
  body("label").optional().trim().isLength({ max: 50 }),
  body("street").trim().notEmpty().withMessage("street is required"),
  body("city").trim().notEmpty().withMessage("city is required"),
  body("state").optional().trim(),
  body("postalCode").trim().notEmpty().withMessage("postalCode is required"),
  body("country").trim().notEmpty().withMessage("country is required"),
  body("isDefault").optional().isBoolean(),
];

export const updateAddressValidator = [
  param("id").isUUID().withMessage("Invalid address id"),
  body("label").optional().trim().isLength({ max: 50 }),
  body("street").optional().trim().notEmpty(),
  body("city").optional().trim().notEmpty(),
  body("state").optional().trim(),
  body("postalCode").optional().trim().notEmpty(),
  body("country").optional().trim().notEmpty(),
  body("isDefault").optional().isBoolean(),
];

export const addressIdParamValidator = [param("id").isUUID().withMessage("Invalid address id")];