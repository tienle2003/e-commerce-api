import { register, login, logout, home, refresh } from "../controllers/authController.js";
import { verifyAccessToken, verifyAdmin, verifyUser, verifyRefreshToken } from "../middleware/auth.js";
import express from "express";
const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/").get(verifyUser, home);
router.route("/logout").post(verifyRefreshToken, logout);
router.route("/refresh").post(refresh);

export default router;
