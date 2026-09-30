import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import categoryRoutes from "./category.routes";
import listingRoutes from "./listing.routes";
import savedListingRoutes from "./savedListing.routes";
import sellerReviewRoutes from "./sellerReview.routes";
import notificationRoutes from "./notification.routes";
import adminReportsRoutes from "./adminReports.routes";
import adminUserRoutes from "./adminUser.routes";
import analyticsRoutes from "./analytics.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/listings", listingRoutes);
router.use("/saved-listings", savedListingRoutes);
router.use("/sellers", sellerReviewRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin/reports", adminReportsRoutes);
router.use("/admin/users", adminUserRoutes);
router.use("/admin/analytics", analyticsRoutes);

export default router;