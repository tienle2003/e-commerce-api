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
  .route("/")
  .get(getAllProducts)
  .post(
    verifyAdmin,
    fileUploader.array("images"),
    verifyImage,
    createProduct
  );
router
  .route("/:id")
  .get(getProductById)
  .put(
    verifyAdmin,
    fileUploader.array("products"),
    verifyImage,
    updateProductById
  )
  .delete(verifyAdmin, deleteProductById);

export default router;
