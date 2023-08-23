import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import moment from "moment/moment.js";
import User from "../models/user.js";
import RefreshToken from "../models/refreshToken.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  saveRefreshToken,
  deleteRefreshToken,
} from "../middleware/auth.js";
import dotenv from "dotenv";
dotenv.config();

const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (existingUser)
      return res.status(409).json({ message: "This email is aready in use!" });
    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({ message: "User registered", newUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred!" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password!" });
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: "Invalid email or password!" });

    const payload = {
      id: user.id,
      role: user.role,
      email: user.email,
    }
    const accessToken = await generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    const expiresIn = parseInt(process.env.REFRESH_TOKEN_EXPIRES);
    const expiresAt = moment()
      .add(expiresIn, "seconds")
      .format("YYYY-MM-DD HH:mm:ss");
    saveRefreshToken(user.id, refreshToken, expiresAt);

    return res
      .status(200)
      .json({ message: "Login successful", accessToken, refreshToken });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

const logout = async (req, res) => {
  const refreshToken = req.body.refreshToken || req.headers["refresh-token"];
  if (!refreshToken || !refreshToken.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided!" });
  }
  const token = refreshToken.split(" ")[1];
  try {
    await deleteRefreshToken(token, req.user.id);
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error while deleting refresh token: ", error);
    return res
      .status(500)
      .json({ message: "An error occurred during logout." });
  }
};

const refresh = async (req, res) => {
  try {
    let token = req.headers["refresh-token"];
    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No refresh token provided!" });
    }
    token = token.split(" ")[1];
    const refreshToken = await RefreshToken.findOne({ where: { token } });
    if (!refreshToken)
      return res
        .status(401)
        .json({ message: "Refresh token is invalid or expired!" });

    Jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) throw err;
      const payload = {
        id: user.id,
        role: user.role,
        email: user.email,
      };
      const newAccessToken = generateAccessToken(payload);
      res
        .setHeader("Authorization", `Bearer ${newAccessToken}`)
        .json({ message: newAccessToken });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while refreshing token!" });
  }
};


export { register, login, logout, refresh };
