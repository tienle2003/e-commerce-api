import { verifyUser } from "../middleware/auth.js";
import validate from "../middleware/validate.js"
import { cartValidation } from "../validations/cartValidation.js";
import { addToCart, getCarts, deleteCartById } from "../controllers/cartController.js";
import express from "express";
const router = express.Router();

router.use(verifyUser);
router.route("/").post(validate(cartValidation.addToCart), addToCart).get(getCarts);
router.route("/:cartId").delete(validate(cartValidation.deleteCart), deleteCartById);

export default router;
