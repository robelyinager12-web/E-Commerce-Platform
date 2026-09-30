import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { listUsersValidator, updateUserValidator } from "../validators/adminUser.validator";
import { getUsersAdmin, patchUserAdmin } from "../controllers/adminUser.controller";

const router = Router();

router.use(authenticate, requireRole("super_admin", "admin"));

router.get("/", listUsersValidator, validate, getUsersAdmin);
router.patch("/:id", updateUserValidator, validate, patchUserAdmin);

export default router;