import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import RefreshToken from "../models/refreshToken.js";

//Function to hash the password
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

const generateAccessToken = (payload) => {
  return Jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES),
  });
};

const generateRefreshToken = (payload) => {
  return Jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES),
  });
};

const verifyAccessToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.body.accessToken;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided!" });
  const accessToken = authHeader.split(" ")[1];
  try {
    const decoded = Jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json(err);
  }
};

const verifyRefreshToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided!" });
  const refreshToken = authHeader.split(" ")[1];
  try {
    const decoded = Jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    throw err;
  }
};

const verifyUser = (req, res, next) => {
  verifyAccessToken(req, res, () => {
    if (req.user.role !== "user")
      return res
        .status(403)
        .json({ message: "Unauthorized: Only user is allowed!" });
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  verifyAccessToken(req, res, () => {
    if (req.user.role !== "admin")
      return res
        .status(403)
        .json({ message: "Unauthorized: Only admin is allowed!" });
    next();
  });
};

const saveRefreshToken = async (userId, refreshToken, expiresAt) => {
  try {
    const existedRefreshToken = await RefreshToken.findOne({ userId });
    if (existedRefreshToken)
      await RefreshToken.updateOne(
        { token: refreshToken, expies_at: expiresAt },
        { where: { user_id: userId } }
      );
    else {
      const sql = {
        user_id: userId,
        token: refreshToken,
        expires_at: expiresAt,
      };
      const newRefreshToken = await RefreshToken.create(sql);
      if (newRefreshToken) console.log("Refresh token saved to the database");
    }
  } catch (error) {
    console.error("Inserting data error in server!");
  }
};

const deleteRefreshToken = async (refreshToken, userId) => {
  try {
    const destroyed = await RefreshToken.destroy({
      where: { token: refreshToken, user_id: userId },
    });
    if (destroyed) console.log("Refresh token deleted successfully");
  } catch (error) {
    console.error("Error deleting token:", error);
  }
};

export {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  saveRefreshToken,
  deleteRefreshToken,
  verifyUser,
  verifyAdmin,
};
