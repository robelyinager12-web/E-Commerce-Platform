import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import { ApiError } from "../utils/apiError.util";

export const postUploadImages = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) {
    throw ApiError.badRequest("No images were uploaded");
  }
  const urls = files.map((file) => `/uploads/${file.filename}`);
  sendSuccess(res, "Images uploaded", { urls }, 201);
});