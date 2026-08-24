import { query } from "express-validator";

export const dateRangeValidator = [
  query("from").optional().isISO8601().withMessage("from must be an ISO 8601 date"),
  query("to").optional().isISO8601().withMessage("to must be an ISO 8601 date"),
];

export const salesOverTimeValidator = [
  ...dateRangeValidator,
  query("interval")
    .optional()
    .isIn(["day", "week", "month"])
    .withMessage("interval must be one of: day, week, month"),
];

export const topProductsValidator = [
  ...dateRangeValidator,
  query("limit").optional().isInt({ min: 1, max: 50 }),
];

export const lowStockValidator = [
  query("threshold").optional().isInt({ min: 0 }),
];