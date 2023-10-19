import Joi from "joi";

const passwordSchema = Joi.string()
  .min(8)
  .pattern(
    new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$"
    )
  )
  .trim()
  .required();
const register = {
  body: Joi.object().keys({
    name: Joi.string().trim().required(),
    email: Joi.string().trim().email().required(),
    password: passwordSchema,
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().trim().email().required(),
    password: passwordSchema,
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().trim().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    password: passwordSchema,
  }),
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

export const authValidation = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
};
