import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import { createListingReport, listReports, resolveReport } from "../services/listingReport.service";

export const postListingReport = asyncHandler(async (req: Request, res: Response) => {
  const { reason, details } = req.body;
  await createListingReport(req.user!.userId, req.params.id, { reason, details });
  sendSuccess(res, "Report submitted. Thank you for helping keep the marketplace safe.", null, 201);
});

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const { items, meta } = await listReports(
    req.query as Record<string, unknown>,
    req.query.status as string | undefined
  );
  sendSuccess(res, "Reports retrieved", { items, meta });
});

export const patchReport = asyncHandler(async (req: Request, res: Response) => {
  const { action, note } = req.body;
  await resolveReport(req.params.id, action, note, req.user!.userId);
  sendSuccess(res, "Report resolved");
});