import sequelize from "../configs/configDatabase.js";
import Review from "../models/review.js";
import User from "../models/user.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import ApiError from "../utils/apiError.js";
import { StatusCodes } from "http-status-codes";

const getReviews = asyncWrapper(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 5, rating } = req.query;
  const filterOptions = {
    product_id: productId,
  };

  if (rating !== "" && rating !== undefined) filterOptions.rating = rating;
  const reviews = await Review.findAndCountAll({
    where: filterOptions,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "avatar", "birth_date", "address"],
      },
    ],
    attributes: ["comment", "rating", "updatedAt"],
    offset: (page - 1) * limit,
    limit: +limit,
  });
  const totalPages = Math.ceil(reviews.count / limit);

  if (reviews.count === 0 || +page > totalPages)
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "No reviews found for this product!"
    );

  res.status(StatusCodes.OK).json({
    currentPage: +page,
    totalPages: totalPages,
    data: reviews.rows,
  });
});

const createReview = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const { productId } = req.params;
  const { comment, rating } = req.body;
  const existingReview = await Review.findOne({
    where: {
      product_id: productId,
      user_id: userId,
    },
  });

  if (existingReview) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "User has already reviewed this product before!"
    );
  }
  
  const newReview = await Review.create({
    product_id: productId,
    user_id: userId,
    comment,
    rating,
  });

  if (!newReview)
    throw new ApiError(StatusCodes.BAD_REQUEST, "Could not save your review.");

  res
    .status(StatusCodes.CREATED)
    .json({ message: "Review added successfully!", data: newReview });
});

const deleteReviewById = asyncWrapper(async (req, res) => {
  const { reviewId } = req.params;
  const review = await Review.findByPk(reviewId);
  if (!review) throw new ApiError(StatusCodes.NOT_FOUND, "Review not found!");
  await review.destroy();
  res.status(StatusCodes.OK).json({ message: "Product deleted successfully!" });
});

export { createReview, getReviews, deleteReviewById };
