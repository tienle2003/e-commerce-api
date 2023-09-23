import { verifyUser } from "../middleware/auth.js";
import {
  addToCart
} from "../controllers/cartController.js";
import express from "express";
const router = express.Router();

router.use(verifyUser);
router.route("/").post(addToCart);
// router.route("/:id").delete(deleteCategory);

export default router;
