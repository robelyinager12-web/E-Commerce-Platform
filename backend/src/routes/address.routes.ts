import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createAddressValidator,
  updateAddressValidator,
  addressIdParamValidator,
} from "../validators/address.validator";
import { getAddresses, postAddress, patchAddress, removeAddress } from "../controllers/address.controller";

const router = Router();

router.use(authenticate);

router.get("/", getAddresses);
router.post("/", createAddressValidator, validate, postAddress);
router.patch("/:id", updateAddressValidator, validate, patchAddress);
router.delete("/:id", addressIdParamValidator, validate, removeAddress);

export default router;