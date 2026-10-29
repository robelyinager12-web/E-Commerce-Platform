import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getMe, patchMe } from "../controllers/user.controller";
import { validate } from "../middlewares/validate.middleware";
import { updateMeValidator } from "../validators/user.validator";

const router = Router();

router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateMeValidator, validate, patchMe);

export default router;