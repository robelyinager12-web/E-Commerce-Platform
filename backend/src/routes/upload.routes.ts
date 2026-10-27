import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middlewares/auth.middleware";
import { uploadImages } from "../middlewares/upload.middleware";
import { postUploadImages } from "../controllers/upload.controller";

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many uploads, please try again later." },
});

router.post("/images", authenticate, uploadLimiter, uploadImages, postUploadImages);

export default router;