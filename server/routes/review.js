import { verifyUser } from "../middleware/auth.js";
import { createReview, getReviews, deleteReviewById } from "../controllers/reviewController.js";
import express from "express";
const router = express.Router();

router.route("/:id").post(verifyUser, createReview).get(getReviews).delete(verifyUser, deleteReviewById);

export default router;