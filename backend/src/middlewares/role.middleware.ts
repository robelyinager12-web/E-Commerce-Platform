import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.util";

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized("Authentication is required"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(ApiError.forbidden("You do not have permission to perform this action"));
      return;
    }

    next();
  };
}