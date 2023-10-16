import Joi from "joi";

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    price: Joi.number().positive().precision(2).required(),
    description: Joi.string(),
    color: Joi.string().required(),
    quantity: Joi.number().positive().integer().default(0),
    brand: Joi.string().required(),
    sold: Joi.number().integer().default(0),
    images: Joi.string().default(null),
    category_id: Joi.number().integer().required(),
  }),
};

const updateProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    price: Joi.number().positive().precision(2).required(),
    description: Joi.string(),
    color: Joi.string().required(),
    quantity: Joi.number().positive().integer().default(0),
    brand: Joi.string().required(),
    sold: Joi.number().integer().default(0),
    images: Joi.string().default(null),
    categoryName: Joi.string().required(),
  }),
  params: Joi.object().keys({
    productId: Joi.string().required().strict(),
  }),
};

const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().required().strict(),
  }),
};

const getProducts = {
  query: Joi.object().keys({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().default(5),
    sort: Joi.string(),
    search: Joi.string(),
    price: Joi.number().positive().precision(2),
    color: Joi.string(),
    quantity: Joi.number().positive().integer(),
    brand: Joi.string().required(),
  }),
};

const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().required().strict(),
  }),
};

export const productValidation = {
  getProducts,
  getProduct,
  deleteProduct,
  createProduct,
  updateProduct,
};
