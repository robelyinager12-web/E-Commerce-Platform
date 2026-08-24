import { body, param } from "express-validator";

export const createCouponValidator = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("code is required")
    .isLength({ max: 50 })
    .withMessage("code must be 50 characters or fewer")
    .customSanitizer((value: string) => value.toUpperCase()),
  body("discountType")
    .isIn(["percentage", "fixed"])
    .withMessage("discountType must be 'percentage' or 'fixed'"),
  body("discountValue")
    .isFloat({ min: 0.01 })
    .withMessage("discountValue must be greater than 0"),
  body("minOrderAmount").optional().isFloat({ min: 0 }),
  body("maxUses").optional().isInt({ min: 1 }),
  body("validFrom").isISO8601().withMessage("validFrom must be an ISO 8601 date"),
  body("validUntil").isISO8601().withMessage("validUntil must be an ISO 8601 date"),
]
  // Cross-field check: percentage discounts capped at 100.
  .concat([
    body("discountValue").custom((value, { req }) => {
      if (req.body.discountType === "percentage" && parseFloat(value) > 100) {
        throw new Error("Percentage discountValue cannot exceed 100");
      }
      return true;
    }),
    body("validUntil").custom((value, { req }) => {
      if (req.body.validFrom && new Date(value) <= new Date(req.body.validFrom)) {
        throw new Error("validUntil must be after validFrom");
      }
      return true;
    }),
  ]);

export const updateCouponValidator = [
  param("id").isUUID().withMessage("Invalid coupon id"),
  body("discountType").optional().isIn(["percentage", "fixed"]),
  body("discountValue").optional().isFloat({ min: 0.01 }),
  body("minOrderAmount").optional().isFloat({ min: 0 }),
  body("maxUses").optional().isInt({ min: 1 }),
  body("validFrom").optional().isISO8601(),
  body("validUntil").optional().isISO8601(),
  body("isActive").optional().isBoolean(),
];

export const couponIdParamValidator = [param("id").isUUID().withMessage("Invalid coupon id")];

export const validateCouponValidator = [
  body("code").trim().notEmpty().withMessage("code is required"),
  body("orderSubtotal")
    .isFloat({ min: 0 })
    .withMessage("orderSubtotal must be a non-negative number"),
];