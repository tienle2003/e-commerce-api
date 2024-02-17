import {
  register,
  login,
  logout,
  refresh,
  verify,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import passport from "passport";
import { verifyRefreshToken } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { authValidation } from "../validations/authValidation.js";
import rateLimiter from "../middleware/rateLimiter.js";
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
router
  .route("/login")
  .post(
    validate(authValidation.login),
    // rateLimiter({ time: 5*60, limit: 5 }),
    login
  );
router.route("/logout").post(verifyRefreshToken, logout);
router.route("/refresh").post(refresh);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);
router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", (err, profile) => {
      req.user = profile;
      next();
    })(req, res, next);
  },
  (req, res) => {
    res.redirect(
      "https://www.youtube.com/watch?v=0V3Cf0bko7k&list=PLGcINiGdJE90yhXdDBNnfMcEjTZdeeJ1L&index=3"
    );
  }
);

export default router;
