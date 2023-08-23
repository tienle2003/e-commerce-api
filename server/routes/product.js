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
  .get(getProductById)
  .delete(verifyAdmin, deleteProductById)
  .post(
    verifyAdmin,
    fileUploader.array("images", 5),
    verifyImage,
    updateProductById
  );

router
  .route("/")
  .get(getAllProducts)
  .post(
    verifyAdmin,
    fileUploader.array("images", 5),
    verifyImage,
    createProduct
  );

export default router;
