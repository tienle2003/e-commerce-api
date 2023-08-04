import express from "express";
const router = express.Router();
import { verifyAdmin } from "../middleware/auth.js";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
} from "../controllers/productController.js";

router.route("/").get(getAllProducts).post(verifyAdmin, createProduct);
router
  .route("/:id")
  .get(getProductById)
  .put(verifyAdmin, updateProductById)
  .delete(verifyAdmin, deleteProductById);

export default router;
