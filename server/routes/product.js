import express from "express";
const router = express.Router();
import { verifyAdmin } from "../middleware/auth.js";
import verifyImage from "../middleware/user.js";
import { fileUploader } from "../configs/cloudinary.config.js";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
} from "../controllers/productController.js";

router
  .route("/:id")
  .post(verifyAdmin, fileUploader.array("images"), verifyImage, updateProductById)
  .get(getProductById)
  .delete(verifyAdmin, deleteProductById);
  
router
  .route("/")
  .get(getAllProducts)
  .post(verifyAdmin, fileUploader.array("images"), verifyImage, createProduct);

export default router;
