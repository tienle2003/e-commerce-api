import { verifyUser } from "../middleware/auth.js";
import { addToCart, getCarts } from "../controllers/cartController.js";
import express from "express";
const router = express.Router();

router.use(verifyUser);
router.route("/").post(addToCart).get(getCarts);
// router.route("/:id").delete(deleteCategory);

export default router;
