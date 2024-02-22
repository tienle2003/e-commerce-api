import express from "express";
import {
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserById,
} from "../controllers/userController.js";
import verifyImage from "../middleware/user.js";
import { verifyAccessToken, verifyAdmin } from "../middleware/auth.js";
import { fileUploader } from "../configs/cloudinary.config.js";
import validate from "../middleware/validate.js";
import { userValidation } from "../validations/userValidations.js";
const router = express.Router();

router.use(verifyAccessToken);
router
  .route("/me")
  .get(getCurrentUser)
  .put(
    validate(userValidation.updateCurrentUser),
    fileUploader.single("avatar"),
    verifyImage,
    updateCurrentUser
  )
  .post(validate(userValidation.changePassword), changePassword);

router.route("/").get(verifyAdmin, getAllUsers);

router.use(verifyAdmin);
router
  .route("/:userId")
  .get(validate(userValidation.getUser), getUserById)
  .delete(validate(userValidation.deleteUser), deleteUserById)
  .put(
    validate(userValidation.updateUser),
    fileUploader.single("avatar"),
    verifyImage,
    updateUserById
  );

export default router;
