import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import { query } from "../config/database";
import { ApiError } from "../utils/apiError.util";

interface PublicUserRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
}

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const result = await query<PublicUserRow>(
    `SELECT id, first_name, last_name, email, role, created_at
     FROM users WHERE id = $1`,
    [req.user!.userId]
  );

  const user = result.rows[0];
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  sendSuccess(res, "Current user retrieved", {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  });
});