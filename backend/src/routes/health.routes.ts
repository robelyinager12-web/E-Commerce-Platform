import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import { sendSuccess } from "../utils/response.util";
import { query } from "../config/database";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const result = await query<{ now: string }>("SELECT NOW() as now");
    sendSuccess(res, "API is healthy", {
      status: "ok",
      dbTime: result.rows[0].now,
    });
  })
);

export default router;