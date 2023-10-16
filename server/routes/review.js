import { verifyUser } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { reviewValidation } from "../validations/reviewValidation.js";
import {
  createReview,
  getReviews,
  deleteReviewById,
} from "../controllers/reviewController.js";
import express from "express";
const router = express.Router();

router
  .route("/:productId")
  .post(verifyUser, validate(reviewValidation.createReview), createReview)
  .get(validate(reviewValidation.getReview), getReviews);
router
  .route("/:reviewId")
  .delete(
    verifyUser,
    validate(reviewValidation.deleteReview),
    deleteReviewById
  );

export default router;
