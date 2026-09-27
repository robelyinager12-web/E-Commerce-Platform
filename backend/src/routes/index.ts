import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import categoryRoutes from "./category.routes";
import listingRoutes from "./listing.routes";
import notificationRoutes from "./notification.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/listings", listingRoutes);
router.use("/notifications", notificationRoutes);

// Saved listings, seller reviews, and admin moderation are added in
// upcoming steps.

export default router;