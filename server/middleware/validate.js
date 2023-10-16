import Joi from "joi";
import pick from "../utils/pick.js";

const validate = (schema) => async (req, res, next) => {
  const validSchema = pick(schema, ["params", "body", "query"]);
  const object = pick(req, Object.keys(validSchema));

  try {
    await Joi.compile(validSchema)
      .prefs({ errors: { label: "key" }, abortEarly: false })
      .validateAsync(object);
    next();
  } catch (error) {
    if (error) {
      const errorMessage = error.details
        .map((details) => details.message)
        .join(", ");
      return res.status(500).json({ message: errorMessage });
    }
  }
};

export default validate;
