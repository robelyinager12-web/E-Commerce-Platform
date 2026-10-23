import fs from "fs";
import path from "path";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ApiError } from "../utils/apiError.util";

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_IMAGES = 10;

// The file extension comes from the validated MIME type, never from the client's file name.
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${EXTENSIONS[file.mimetype]}`),
});

const uploader = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_BYTES, files: MAX_IMAGES },
  fileFilter: (_req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) {
      cb(null, true);
    } else {
      cb(ApiError.badRequest("Only JPG, PNG or WEBP images are allowed"));
    }
  },
});

/** Accepts up to 10 images in the multipart field "images" and turns multer errors into 400s. */
export function uploadImages(req: Request, res: Response, next: NextFunction): void {
  uploader.array("images", MAX_IMAGES)(req, res, (err: unknown) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Each image must be 10MB or smaller"
          : `You can upload up to ${MAX_IMAGES} images`;
      return next(ApiError.badRequest(message));
    }
    next(err);
  });
}