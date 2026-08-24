import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import cartRoutes from "./cart.routes";
import wishlistRoutes from "./wishlist.routes";
import orderRoutes from "./order.routes";
import addressRoutes from "./address.routes";
import reviewRoutes from "./review.routes";
import analyticsRoutes from "./analytics.routes";
import couponRoutes from "./coupon.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", orderRoutes);
router.use("/addresses", addressRoutes);
router.use("/reviews", reviewRoutes);
router.use("/admin/analytics", analyticsRoutes);
router.use("/coupons", couponRoutes);

export default router;