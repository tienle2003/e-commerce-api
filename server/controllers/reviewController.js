import sequelize from "../configs/configDatabase.js";
import Review from "../models/review.js";
import User from "../models/user.js";

const getReviews = async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 5, rating } = req.query;
  const filterOptions = {
    product_id: productId,
  };
  console.log(rating);

  if (rating !== "" && rating !== undefined) filterOptions.rating = rating;
  try {
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
      return res
        .status(404)
        .json({ message: "No reviews found for this product!" });

    return res.status(200).json({
      currentPage: +page,
      totalPages: totalPages,
      data: reviews.rows,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const createReview = async (req, res) => {
  const { userId } = req.user;
  const { productId } = req.params;
  const { comment, rating } = req.body;
  try {
    const existingReview = await Review.findOne({
      where: {
        product_id: productId,
        user_id: userId,
      },
    });

    if (existingReview)
      return res
        .status(400)
        .json({ message: "User has already reviewed this product before!" });

    const newReview = await Review.create({
      product_id: productId,
      user_id: userId,
      comment,
      rating,
    });

    if (!newReview)
      return res.status(400).json({ message: "Could not save your review." });

    return res
      .status(201)
      .json({ message: "Review added successfully!", data: newReview });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const deleteReviewById = async (req, res) => {
  const { reviewId } = req.params;
  try {
    const review = await Review.findByPk(reviewId);

    if (!review) return res.status(404).json({ message: "Review not found!" });

    await review.destroy();
    return res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

export { createReview, getReviews, deleteReviewById };
