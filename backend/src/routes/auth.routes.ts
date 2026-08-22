import { Router } from "express";
import rateLimit from "express-rate-limit";
import { registerValidator, loginValidator } from "../validators/auth.validator";
import { validate } from "../middlewares/validate.middleware";
import { register, login, refresh, logout } from "../controllers/auth.controller";

const router = Router();

// Tighter rate limit on auth endpoints to slow down credential stuffing / brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later." },
});

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
router.post("/refresh", authLimiter, refresh);
router.post("/logout", logout);

export default router;