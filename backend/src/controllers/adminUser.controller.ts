import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import { listUsers, updateUserAdmin } from "../services/adminUser.service";
import { logAudit } from "../utils/audit.util";

export const getUsersAdmin = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    search: req.query.search as string | undefined,
    role: req.query.role as string | undefined,
  };
  const { items, meta } = await listUsers(req.query as Record<string, unknown>, filters);
  sendSuccess(res, "Users retrieved", { items, meta });
});

export const patchUserAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { isActive, role } = req.body;
  await updateUserAdmin(req.user!.userId, req.params.id, { isActive, role });
  await logAudit({
    userId: req.user!.userId,
    action: "ADMIN_USER_UPDATED",
    entityType: "user",
    entityId: req.params.id,
    metadata: { isActive, role },
  });
  sendSuccess(res, "User updated successfully");
});