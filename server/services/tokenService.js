import refreshToken from "../models/refreshToken.js";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../configs/config.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const generateToken = async (payload, secret, expires) => {
  try {
    return Jwt.sign(payload, secret, { expiresIn: expires });
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const generateAuthToken = async (user) => {
  try {
    const payload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };
    const accessToken = await generateToken(
      { ...payload, type: "access token" },
      config.jwt.accessTokenSecret,
      config.jwt.accessTokenExpires
    );
    const refreshToken = await generateToken(
      { ...payload, type: "refresh token" },
      config.jwt.refreshTokenSecret,
      config.jwt.refreshTokenExpires
    );
    const expiresAt = Date.now() + config.jwt.refreshTokenExpires * 1000;
    await saveToken(user.id, refreshToken, expiresAt);
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const generateVerifyEmailToken = async (user) => {
  const payload = {
    userId: user.id,
    role: user.role,
    email: user.email,
    type: "verify email token",
  };
  return await generateToken(
    payload,
    config.jwt.verifyTokenSecret,
    config.jwt.verifyTokenExpires
  );
};

const generateResetPasswordToken = async (user) => {
  const payload = {
    userId: user.id,
    role: user.role,
    email: user.email,
    type: "reset password token",
  };
  return await generateToken(
    payload,
    config.jwt.resetTokenSecret,
    config.jwt.resetTokenExpires
  );
};

const generateAccessToken = async (user) => {
  const payload = {
    userId: user.id,
    role: user.role,
    email: user.email,
    type: "access token",
  };
  return await generateToken(
    payload,
    config.jwt.accessTokenSecret,
    config.jwt.accessTokenExpires
  );
};

const saveToken = async (userId, token, expiresAt) => {
  try {
    const existedRefreshToken = await refreshToken.findOne({
      where: { user_id: userId },
    });
    if (existedRefreshToken) {
      await existedRefreshToken.update({
        token: token,
        expires_at: expiresAt,
      });
    } else {
      const sql = {
        user_id: userId,
        token,
        expires_at: expiresAt,
      };
      const newRefreshToken = await refreshToken.create(sql);
      if (newRefreshToken) console.log("Refresh token saved to the database");
    }
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const deleteToken = async (userId, token) => {
  try {
    const destroyed = await refreshToken.destroy({
      where: { token, user_id: userId },
    });
    if (destroyed) console.log("Refresh token deleted successfully");
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(parseInt(config.jwt.salt));
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

export {
  generateAccessToken,
  generateAuthToken,
  generateVerifyEmailToken,
  saveToken,
  deleteToken,
  hashPassword,
  generateResetPasswordToken,
};
