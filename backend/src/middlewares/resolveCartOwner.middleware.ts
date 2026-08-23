import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { env } from "../config/env";

const GUEST_CART_COOKIE = "guestCartId";
const GUEST_CART_COOKIE_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

declare global {
  namespace Express {
    interface Request {
      cartOwner?: { userId?: string; sessionId?: string };
    }
  }
}

/**
 * Determines cart ownership for the request:
 * - If the user is authenticated (req.user set by optionalAuthenticate
 *   earlier in the chain), the cart belongs to that user.
 * - Otherwise, falls back to a guest session id stored in a cookie,
 *   creating one if it doesn't exist yet.
 */
export function resolveCartOwner(req: Request, res: Response, next: NextFunction): void {
  if (req.user) {
    req.cartOwner = { userId: req.user.userId };
    next();
    return;
  }

  let sessionId = req.cookies?.[GUEST_CART_COOKIE];
  if (!sessionId) {
    sessionId = randomUUID();
    res.cookie(GUEST_CART_COOKIE, sessionId, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "strict",
      maxAge: GUEST_CART_COOKIE_MAX_AGE_MS,
    });
  }

  req.cartOwner = { sessionId };
  next();
}