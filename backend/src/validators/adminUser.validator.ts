import { body, param, query } from "express-validator";

export const listUsersValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("search").optional().isString().trim(),
  query("role").optional().isIn(["super_admin", "admin", "staff", "customer"]),
];

export const userIdParamValidator = [param("id").isUUID().withMessage("Invalid user id")];

export const updateUserValidator = [
  param("id").isUUID().withMessage("Invalid user id"),
  body("isActive").optional().isBoolean(),
  body("role").optional().isIn(["super_admin", "admin", "staff", "customer"]),
];