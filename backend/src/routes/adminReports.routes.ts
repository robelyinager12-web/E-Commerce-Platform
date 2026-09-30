import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { listReportsValidator, resolveReportValidator } from "../validators/listingReport.validator";
import { getReports, patchReport } from "../controllers/listingReport.controller";

const router = Router();

router.use(authenticate, requireRole("super_admin", "admin", "staff"));

router.get("/", listReportsValidator, validate, getReports);
router.patch("/:id", resolveReportValidator, validate, patchReport);

export default router;