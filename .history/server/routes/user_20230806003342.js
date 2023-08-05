import express from "express";
import {
  getUserByToken,
  updateUserByToken,
  changePassword,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserById,
} from "../controllers/userController.js";
import verifyImage from "../middleware/user.js";
import {
  verifyAccessToken,
  verifyAdmin,
  verifyUser,
} from "../middleware/auth.js";
import { fileUploader } from "../configs/cloudinary.config.js";
const router = express.Router();

router.use(verifyAccessToken);
router
  .route("/me")
  .get(getUserByToken)
  .put(fileUploader.single("avatar"), verifyImage, updateUserByToken)
  .post(changePassword);

router.route("/").get(verifyAdmin, getAllUsers);

router.use(verifyAdmin);
router
  .route("/:id")
  .get(getUserById)
  .delete(deleteUserById)
  .put(fileUploader.single("avatar"), verifyImage, updateUserById);

export default router;
