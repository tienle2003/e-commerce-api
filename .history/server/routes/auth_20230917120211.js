import { register, login, logout, refresh, verify, sendVerificationEmail, forgotPassword, resetPassword } from "../controllers/authController.js";
import { verifyAccessToken, verifyAdmin, verifyUser, verifyRefreshToken } from "../middleware/auth.js";
import express from "express";
const router = express.Router();

router.route("/register").post(register);
// router.route("/send-verification-email").post(sendVerificationEmail);
router.route("/verify-email").get(verify);
// router.route("/forgot-password").post(forgotPassword);
// router.route("/reset-password").post(resetPassword);
router.route("/login").post(login);
router.route("/logout").post(verifyRefreshToken, logout);
router.route("/refresh").post(refresh);

export default router;
