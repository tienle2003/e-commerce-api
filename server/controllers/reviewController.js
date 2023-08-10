import Review from "../models/review.js";
import User from "../models/user.js";

const getReviews = async (req, res) => {
  const productId = req.params.id;
  const { page = 1, limit = 5, rating } = req.query;
  const filterOptions = {
    product_id: productId,
  }

  if(rating !== "" && rating !== undefined) filterOptions.rating = rating
  try {
    const reviews = await Review.findAll({
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

    if (reviews.length === 0)
      return res
        .status(404)
        .json({ message: "No reviews found for this product!" });

    return res.status(200).json({ data: reviews });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const createReview = async (req, res) => {
  const userId = req.user.id;
  const productId = +req.params.id;
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

export { createReview, getReviews };
