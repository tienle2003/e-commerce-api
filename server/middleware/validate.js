import Joi from "joi";
import pick from "../utils/pick.js";
import ApiError from "../utils/apiError.js";
import { StatusCodes } from "http-status-codes";

const validate = (schema) => async (req, res, next) => {
  const validSchema = pick(schema, ["params", "body", "query"]);
  const object = pick(req, Object.keys(validSchema));

  try {
    await Joi.compile(validSchema)
      .prefs({ errors: { label: "key" }, abortEarly: false })
      .validateAsync(object);
    next();
  } catch (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(", ");
    return next(new ApiError(StatusCodes.BAD_REQUEST, errorMessage));
  }
};

export default validate;
