import { body, param, query } from "express-validator";

const addressFieldsValidator = (prefix: string) => [
  body(`${prefix}.street`).trim().notEmpty().withMessage(`${prefix}.street is required`),
  body(`${prefix}.city`).trim().notEmpty().withMessage(`${prefix}.city is required`),
  body(`${prefix}.state`).optional().trim(),
  body(`${prefix}.postalCode`).trim().notEmpty().withMessage(`${prefix}.postalCode is required`),
  body(`${prefix}.country`).trim().notEmpty().withMessage(`${prefix}.country is required`),
];

export const checkoutValidator = [
  ...addressFieldsValidator("shippingAddress"),
  body("billingAddress").optional().isObject(),
  body("billingAddress.street").optional().trim().notEmpty(),
  body("billingAddress.city").optional().trim().notEmpty(),
  body("billingAddress.postalCode").optional().trim().notEmpty(),
  body("billingAddress.country").optional().trim().notEmpty(),
  body("couponCode").optional().trim().isString(),
];

export const listOrdersValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("status")
    .optional()
    .isIn(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]),
];

export const orderIdParamValidator = [param("id").isUUID().withMessage("Invalid order id")];

export const updateOrderStatusValidator = [
  param("id").isUUID().withMessage("Invalid order id"),
  body("status")
    .isIn(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"])
    .withMessage("Invalid order status"),
  body("note").optional().isString().trim(),
];