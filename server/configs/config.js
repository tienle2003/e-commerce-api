import Joi from "joi";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(path.dirname.name, "../../.env") });

const envSchema = Joi.object()
  .keys({
    PORT: Joi.number().default(3000),
    DB_PASSWORD: Joi.string().required(),
    DB_USER: Joi.string().default("root"),
    DB_HOST: Joi.string().default("localhost"),
    DB_SCHEMA: Joi.string().required(),
    SALT: Joi.number().default(10),
    ACCESS_TOKEN_SECRET: Joi.string().required(),
    REFRESH_TOKEN_SECRET: Joi.string().required(),
    VERIFY_TOKEN_SECRET: Joi.string().required(),
    RESET_TOKEN_SECRET: Joi.string().required(),
    ACCESS_TOKEN_EXPIRES: Joi.number().default(3600),
    REFRESH_TOKEN_EXPIRES: Joi.number().default(604800),
    VERIFY_TOKEN_EXPIRES: Joi.number().default(120),
    RESET_TOKEN_EXPIRES: Joi.number().default(120),
    CLOUDINARY_NAME: Joi.string().required(),
    CLOUDINARY_KEY: Joi.string().required(),
    CLOUDINARY_SECRET: Joi.string().required(),
    EMAIL_PASSWORD: Joi.string().required(),
    EMAIL_USERNAME: Joi.string().required(),
    EMAIL_PORT: Joi.number().required(),
    GOOGLE_CLENT_ID: Joi.string().required(),
    GOOGLE_CLIENT_SECRET: Joi.string().required(),
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.number().required(),
    REDIS_URL: Joi.string().required(),
  })
  .unknown();

const { value: env, error } = envSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error)
  throw new ApiError(
    StatusCodes.NOT_FOUND,
    `config validation error: ${error.message}`
  );

export default {
  port: env.PORT,
  database: {
    password: env.DB_PASSWORD,
    user: env.DB_USER,
    host: env.DB_HOST,
    schema: env.DB_SCHEMA,
  },
  jwt: {
    salt: env.SALT,
    accessTokenSecret: env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: env.REFRESH_TOKEN_SECRET,
    verifyTokenSecret: env.VERIFY_TOKEN_SECRET,
    resetTokenSecret: env.RESET_TOKEN_SECRET,
    accessTokenExpires: env.ACCESS_TOKEN_EXPIRES,
    refreshTokenExpires: env.REFRESH_TOKEN_EXPIRES,
    verifyTokenExpires: env.VERIFY_TOKEN_EXPIRES,
    resetTokenExpires: env.RESET_TOKEN_EXPIRES,
  },
  cloudinary: {
    name: env.CLOUDINARY_NAME,
    key: env.CLOUDINARY_KEY,
    secret: env.CLOUDINARY_SECRET,
  },
  email: {
    username: env.EMAIL_USERNAME,
    password: env.EMAIL_PASSWORD,
    port: env.EMAIL_PORT,
  },
  google: {
    clientId: env.GOOGLE_CLENT_ID,
    secretId: env.GOOGLE_CLIENT_SECRET,
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    URL: env.REDIS_URL,
  },
};
