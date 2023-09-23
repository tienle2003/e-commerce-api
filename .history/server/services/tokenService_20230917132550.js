import refreshToken from "../models/refreshToken.js";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import moment from "moment/moment.js";

const generateToken = (payload, secret, expires) => {
  return Jwt.sign(payload, secret, { expiresIn: expires });
};

const generateAuthToken = async (user) => {
  const payload = {
    userId: user.id,
    role: user.role,
    email: user.email,
  };
  const accessToken = generateToken(
    { ...payload, type: "access token" },
    process.env.ACCESS_TOKEN_SECRET,
    +process.env.ACCESS_TOKEN_EXPIRES
  );
  const refreshToken = generateToken(
    { ...payload, type: "refresh token" },
    process.env.REFRESH_TOKEN_SECRET,
    +process.env.REFRESH_TOKEN_EXPIRES
  );
  const expiresIn = parseInt(process.env.REFRESH_TOKEN_EXPIRES);
  const expiresAt = moment()
    .add(expiresIn, "seconds")
    .format("YYYY-MM-DD HH:mm:ss");
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
  const verifyEmailToken = generateToken(
    payload,
    process.env.VERIFY_TOKEN_SECRET,
    +process.env.VERIFY_TOKEN_EXPIRES
  );
  return verifyEmailToken;
};

const generateResetPasswordToken = async (user) => {
  const payload = {
    userId: user.id,
    role: user.role,
    email: user.email,
    type: "reset password token",
  };
  const resetPasswordToken = generateToken(
    payload,
    process.env.RESET_TOKEN_SECRET,
    +process.env.RESET_TOKEN_EXPIRES
  );
  return resetPasswordToken;
};

const generateAccessToken = (user) => {
  const payload = {
    userId: user.id,
    role: user.role,
    email: user.email,
    type: "access token",
  };
  return generateToken(
    payload,
    process.env.ACCESS_TOKEN_SECRET,
    +process.env.ACCESS_TOKEN_EXPIRES
  );
};

const saveToken = async (userId, token, expiresAt) => {
  try {
    const existedRefreshToken = await refreshToken.findOne({
      where: { user_id: userId },
    });
    if (existedRefreshToken) {
      await existedRefreshToken.update({ token: token, expies_at: expiresAt });
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
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT));
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
  generateResetPasswordToken
};
