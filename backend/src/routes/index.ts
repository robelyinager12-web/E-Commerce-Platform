import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// Additional resource routes (products, orders, etc.) will be
// mounted here in upcoming steps, e.g.:
// router.use("/products", productRoutes);

export default router;