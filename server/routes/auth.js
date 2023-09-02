import { register, login, logout, refresh, verify } from "../controllers/authController.js";
import { verifyAccessToken, verifyAdmin, verifyUser, verifyRefreshToken } from "../middleware/auth.js";
import express from "express";
const router = express.Router();

router.route("/register").post(register);
router.route("/verify").get(verify);
router.route("/login").post(login);
router.route("/logout").post(verifyRefreshToken, logout);
router.route("/refresh").post(refresh);

export default router;
