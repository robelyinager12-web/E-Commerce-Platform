import { Router } from "express";
import { optionalAuthenticate } from "../middlewares/auth.middleware";
import { resolveCartOwner } from "../middlewares/resolveCartOwner.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  addCartItemValidator,
  updateCartItemValidator,
  cartItemIdParamValidator,
} from "../validators/cart.validator";
import {
  getMyCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  deleteCart,
} from "../controllers/cart.controller";

const router = Router();

// Every cart route works for guests (via a session cookie) and for
// logged-in users (via their JWT) alike.
router.use(optionalAuthenticate, resolveCartOwner);

router.get("/", getMyCart);
router.post("/items", addCartItemValidator, validate, addCartItem);
router.patch("/items/:itemId", updateCartItemValidator, validate, updateCartItem);
router.delete("/items/:itemId", cartItemIdParamValidator, validate, deleteCartItem);
router.delete("/", deleteCart);

export default router;