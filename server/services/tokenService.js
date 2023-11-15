import refreshToken from "../models/refreshToken.js";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../configs/config.js";

const generateToken = async (payload, secret, expires) => {
  return Jwt.sign(payload, secret, { expiresIn: expires });
};

const generateAuthToken = async (user) => {
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
  saveToken(user.id, refreshToken, expiresAt);
  return { accessToken, refreshToken };
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
    console.error("Inserting data error in server!");
  }
};

const deleteToken = async (userId, token) => {
  try {
    const destroyed = await refreshToken.destroy({
      where: { token, user_id: userId },
    });
    if (destroyed) console.log("Refresh token deleted successfully");
  } catch (error) {
    console.error("Error deleting token:", error);
  }
};

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(parseInt(config.jwt.salt));
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (err) {
    console.log(err);
    throw new Error("Error for hashing password!");
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
