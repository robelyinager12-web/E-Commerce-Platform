import { body } from "express-validator";

export const updateMeValidator = [
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("First name cannot be empty")
    .isLength({ max: 100 })
    .withMessage("First name must be 100 characters or fewer"),
  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Last name cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Last name must be 100 characters or fewer"),
  body("phone")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage("Phone number must be 20 characters or fewer"),
];