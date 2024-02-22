import express from "express";
const router = express.Router();
import { verifyAdmin } from "../middleware/auth.js";
import verifyImage from "../middleware/user.js";
import validate from "../middleware/validate.js";
import { productValidation } from "../validations/productValidation.js";
import { fileUploader } from "../configs/cloudinary.config.js";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
} from "../controllers/productController.js";

router
  .route("/:productId")
  .get(validate(productValidation.getProduct), getProductById)
  .delete(
    verifyAdmin,
    validate(productValidation.deleteProduct),
    deleteProductById
  )
  .post(
    verifyAdmin,
    validate(productValidation.updateProduct),
    fileUploader.array("images", 5),
    verifyImage,
    updateProductById
  );

router
  .route("/")
  .get(validate(productValidation.getProducts), getProducts)
  .post(
    verifyAdmin,
    validate(productValidation.createProduct),
    fileUploader.array("images", 5),
    verifyImage,
    createProduct
  );

export default router;
