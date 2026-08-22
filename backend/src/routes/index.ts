import { Router } from "express";
import healthRoutes from "./health.routes";

const router = Router();

router.use("/health", healthRoutes);

// Additional resource routes (auth, products, orders, etc.) will be
// mounted here in upcoming steps, e.g.:
// router.use("/auth", authRoutes);
// router.use("/products", productRoutes);

export default router;