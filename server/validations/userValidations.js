import Joi from "joi";

const updateBody = Joi.object().keys({
  name: Joi.string().trim(),
  birthDate: Joi.date().iso(),
  address: Joi.string().trim(),
  phone: Joi.string().regex(/^\d{4}-\d{3}-\d{3}$/),
});

const password = Joi.string()
  .min(8)
  .pattern(
    new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$"
    )
  )
  .trim()
  .required()
  .strict();

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.number().required(),
  }),
  body: updateBody,
};

const updateCurrentUser = {
  body: updateBody,
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.number().required(),
  }),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.number().required(),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    currentPassword: password,
    newPassword: password,
  }),
};

export const userValidation = {
  updateUser,
  updateCurrentUser,
  getUser,
  deleteUser,
  changePassword,
};
