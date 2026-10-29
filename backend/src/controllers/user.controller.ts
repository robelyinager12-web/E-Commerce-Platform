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
  phone: string | null;
  role: string;
  created_at: string;
}

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const result = await query<PublicUserRow>(
    `SELECT id, first_name, last_name, email, phone, role, created_at
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
    phone: user.phone,
    role: user.role,
    createdAt: user.created_at,
  });
});

export const patchMe = asyncHandler(async (req: Request, res: Response) => {
  const updates: string[] = [];
  const values: unknown[] = [];

  if (req.body.firstName !== undefined) {
    values.push(req.body.firstName);
    updates.push(`first_name = $${values.length}`);
  }
  if (req.body.lastName !== undefined) {
    values.push(req.body.lastName);
    updates.push(`last_name = $${values.length}`);
  }
  if (req.body.phone !== undefined) {
    values.push(req.body.phone?.trim() || null);
    updates.push(`phone = $${values.length}`);
  }
  if (updates.length === 0) {
    throw ApiError.badRequest("Provide at least one contact detail to update");
  }

  values.push(req.user!.userId);
  const result = await query<PublicUserRow>(
    `UPDATE users
     SET ${updates.join(", ")}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING id, first_name, last_name, email, phone, role, created_at`,
    values
  );
  const user = result.rows[0];
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  sendSuccess(res, "Contact details updated", {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.created_at,
  });
});