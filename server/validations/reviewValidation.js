import Joi from "joi";

const createReview = {
  params: Joi.object().keys({
    productId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    comment: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
  }),
};

const getReview = {
  params: Joi.object().keys({
    productId: Joi.string().required(),
  }),
  query: Joi.object().keys({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(5),
    rating: Joi.number().integer().min(1).max(5).required(),
  }),
};

const deleteReview = {
  params: Joi.object().keys({
    reviewId: Joi.string().required(),
  }),
};

export const reviewValidation = {
  createReview,
  getReview,
  deleteReview,
};
