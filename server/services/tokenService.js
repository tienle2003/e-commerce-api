import Token from "../models/token.js";
import Jwt from "jsonwebtoken";

const generateToken = (payload, secret, expires) => {
  return Jwt.sign(payload, secret, { expiresIn: expires });
};

const generateAuthToken = async (user) => {
  const data = {
    id: user.id,
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
  return { accessToken, refreshToken };
};

const generateVerifyEmailToken = async (email) => {
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

const generateResetPasswordToken = async (email) => {
    
}

// const generateAccessToken = (payload) => {
//   return Jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
//     expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES),
//   });
// };

// const generateRefreshToken = (payload) => {
//   return Jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
//     expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES),
//   });
// };

const saveToken = async (userId, token, type, expiresAt) => {
  try {
    const existedRefreshToken = await Token.findOne({
      user_id: userId,
      type: "refresh",
    });
    if (existedRefreshToken) {
      await Token.update(
        { token: token, expies_at: expiresAt },
        { where: { user_id: userId, type } }
      );
    } else {
      const sql = {
        user_id: userId,
        token: token,
        type: type,
        expires_at: expiresAt,
      };
      const newRefreshToken = await Token.create(sql);
      if (newRefreshToken) console.log("Refresh token saved to the database");
    }
  } catch (error) {
    console.error("Inserting data error in server!");
  }
};

const deleteToken = async (token, userId) => {
  try {
    const destroyed = await Token.destroy({
      where: { token: refreshToken, user_id: userId },
    });
    if (destroyed) console.log("Refresh token deleted successfully");
  } catch (error) {
    console.error("Error deleting token:", error);
  }
};

export { generateAuthToken, generateVerifyEmailToken, saveToken, deleteToken };
