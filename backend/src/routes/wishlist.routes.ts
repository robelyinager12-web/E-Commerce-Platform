import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { addWishlistItemValidator, productIdParamValidator } from "../validators/wishlist.validator";
import { getWishlist, postWishlistItem, deleteWishlistItem } from "../controllers/wishlist.controller";

const router = Router();

router.use(authenticate);

router.get("/", getWishlist);
router.post("/", addWishlistItemValidator, validate, postWishlistItem);
router.delete("/:productId", productIdParamValidator, validate, deleteWishlistItem);

export default router;