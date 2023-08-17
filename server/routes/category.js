import { verifyAdmin } from "../middleware/auth.js";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
} from "../controllers/categoryController.js";
import express from "express";
const router = express.Router();

router.use(verifyAdmin);
router.route("/").post(createCategory).get(getAllCategories);
router.route("/:id").delete(deleteCategory);

export default router;
