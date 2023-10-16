import { verifyAdmin } from "../middleware/auth.js";
import validate from "../middleware/validate.js"
import { categoryValidation } from "../validations/categoryValidation.js";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
} from "../controllers/categoryController.js";
import express from "express";
const router = express.Router();

router.use(verifyAdmin);
router.route("/").post(validate(categoryValidation.createCategory), createCategory).get(getAllCategories);
router.route("/:categoryId").delete(validate(categoryValidation.deleteCategory), deleteCategory);

export default router;
