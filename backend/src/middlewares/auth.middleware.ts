import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { ApiError } from "../utils/apiError.util";

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    next(ApiError.unauthorized("Authentication token is required"));
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired access token"));
  }
}

/**
 * Like authenticate(), but never rejects the request. If a valid Bearer
 * token is present, req.user is populated; otherwise the request proceeds
 * as an anonymous/guest request. Used for routes like the cart that work
 * for both logged-in users and guests.
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length);
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Ignore invalid/expired tokens on optional routes - treat as guest.
    }
  }

  next();
}