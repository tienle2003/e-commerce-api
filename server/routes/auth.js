import {
  register,
  login,
  logout,
  refresh,
  verify,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { verifyRefreshToken } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { authValidation } from "../validations/authValidation.js";
import express from "express";
const router = express.Router();

router.route("/register").post(validate(authValidation.register), register);
router.route("/verify-email").get(validate(authValidation.verifyEmail), verify);
router
  .route("/forgot-password")
  .post(validate(authValidation.forgotPassword), forgotPassword);
router
  .route("/reset-password")
  .put(validate(authValidation.resetPassword), resetPassword);
router.route("/login").post(validate(authValidation.login), login);
router.route("/logout").post(verifyRefreshToken, logout);
router.route("/refresh").post(refresh);

export default router;
