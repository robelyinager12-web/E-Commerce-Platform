import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import { registerUser, loginUser, refreshAccessToken } from "../services/auth.service";
import { ApiError } from "../utils/apiError.util";
import { env } from "../config/env";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "strict",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: "/api/v1/auth",
  });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;
  const result = await registerUser({ firstName, lastName, email, password });

  setRefreshCookie(res, result.refreshToken);
  sendSuccess(
    res,
    "Account created successfully",
    { user: result.user, accessToken: result.accessToken },
    201
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await loginUser({ email, password });

  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, "Logged in successfully", {
    user: result.user,
    accessToken: result.accessToken,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    throw ApiError.unauthorized("No refresh token provided");
  }

  const result = await refreshAccessToken(token);
  sendSuccess(res, "Access token refreshed", { accessToken: result.accessToken });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/v1/auth" });
  sendSuccess(res, "Logged out successfully");
});