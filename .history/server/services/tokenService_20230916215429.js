import Token from "../models/token.js";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import moment from "moment/moment.js";
import User from "../models/user.js";

const generateToken = (payload, secret, expires) => {
  return Jwt.sign(payload, secret, { expiresIn: expires });
};

const generateAuthToken = async (user) => {
  const data = {
    userId: user.id,
    role: user.role,
    email: user.email,
  };
  const accessToken = generateToken(
    { ...data, type: "access" },
    process.env.ACCESS_TOKEN_SECRET,
    +process.env.ACCESS_TOKEN_EXPIRES
  );
  const refreshToken = generateToken(
    { ...data, type: "refresh" },
    process.env.REFRESH_TOKEN_SECRET,
    +process.env.REFRESH_TOKEN_EXPIRES
  );
  const expiresIn = parseInt(process.env.REFRESH_TOKEN_EXPIRES);
  const expiresAt = moment()
    .add(expiresIn, "seconds")
    .format("YYYY-MM-DD HH:mm:ss");
  saveToken(user.id, refreshToken, "refresh", expiresAt);
  return { accessToken, refreshToken };
};

const generateVerifyEmailToken = async (email) => {
  const user = await User.findOne({ where: { email } });
  const payload = {
    userId: user.id,
    role: user.role,
    email,
    type: "verifyEmail",
  };
  const verifyEmailToken = generateToken(
    payload,
    process.env.VERIFY_TOKEN_SECRET,
    +process.env.VERIFY_TOKEN_EXPIRES
  );
  const expiresIn = parseInt(process.env.VERIFY_TOKEN_EXPIRES);
  const expiresAt = moment()
    .add(expiresIn, "seconds")
    .format("YYYY-MM-DD HH:mm:ss");
  saveToken(user.id, verifyEmailToken, "verifyEmail", expiresAt);
  return verifyEmailToken;
};

const generateResetPasswordToken = async (email) => {
  const payload = {
    email,
    type: "verifyEmail",
  };
  const verifyEmailToken = generateToken(
    payload,
    process.env.VERIFY_TOKEN_SECRET,
    +process.env.VERIFY_TOKEN_EXPIRES
  );
  return verifyEmailToken;
};

const generateAccessToken = (user) => {
  const data = {
    userId: user.id,
    role: user.role,
    email: user.email,
  };
  return (accessToken = generateToken(
    { ...data, type: "access" },
    process.env.ACCESS_TOKEN_SECRET,
    +process.env.ACCESS_TOKEN_EXPIRES
  ));
};

const saveToken = async (userId, token, type, expiresAt) => {
  try {
    const existedRefreshToken = await Token.findOne({
      where: { user_id: userId, type: "refresh" },
    });
    if (existedRefreshToken && type === "refresh") {
      await existedRefreshToken.update({ token: token, expies_at: expiresAt });
    } else {
      const sql = {
        user_id: userId,
        token,
        type,
        expires_at: expiresAt,
      };
      const newRefreshToken = await Token.create(sql);
      if (newRefreshToken) console.log("Refresh token saved to the database");
    }
  } catch (error) {
    console.error("Inserting data error in server!");
  }
};

const deleteToken = async (userId, token, type) => {
  try {
    const destroyed = await Token.destroy({
      where: { token, user_id: userId, type },
    });
    if (destroyed) console.log("token deleted successfully");
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
};
