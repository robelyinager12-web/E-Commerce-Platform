import { body, param, query } from "express-validator";

const REPORT_REASONS = ["spam", "scam", "prohibited_item", "duplicate", "other"];

export const createReportValidator = [
  param("id").isUUID().withMessage("Invalid listing id"),
  body("reason").isIn(REPORT_REASONS).withMessage(`reason must be one of: ${REPORT_REASONS.join(", ")}`),
  body("details").optional().isString().trim().isLength({ max: 1000 }),
];

export const listReportsValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("status").optional().isIn(["pending", "resolved", "dismissed"]),
];

export const reportIdParamValidator = [param("id").isUUID().withMessage("Invalid report id")];

export const resolveReportValidator = [
  param("id").isUUID().withMessage("Invalid report id"),
  body("action").isIn(["dismiss", "remove_listing"]).withMessage("action must be 'dismiss' or 'remove_listing'"),
  body("note").optional().isString().trim().isLength({ max: 500 }),
];