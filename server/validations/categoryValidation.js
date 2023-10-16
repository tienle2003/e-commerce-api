import Joi from "joi";

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().trim().required(),
  }),
};

const deleteCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().required(),
  }),
};

export const categoryValidation = {
  createCategory,
  deleteCategory,
};
