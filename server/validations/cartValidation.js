import Joi from "joi";

const addToCart = {
  body: Joi.object().keys({
    productId: Joi.number().required(),
    quantity: Joi.number().positive().integer().required(),
  }),
};

const deleteCart = {
  params: Joi.object().keys({
    cartId: Joi.string().required(),
  }),
};


export const cartValidation = {
  addToCart,
  deleteCart,
};
