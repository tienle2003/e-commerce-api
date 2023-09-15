import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import moment from "moment/moment.js";
import User from "../models/user.js";
import Token from "../models/token.js";
import sendVerifyEmail from "../providers/nodemailer.js";

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
    //check email exists or not
    const existingUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (existingUser)
      return res.status(409).json({ message: "This email is aready in use!" });

    // //generate new token
    const token = Jwt.sign({ email }, process.env.VERIFY_TOKEN_SECRET, {
      expiresIn: +process.env.VERIFY_TOKEN_EXPIRES,
    });

    //Send the token to the email you just created
    sendVerifyEmail(token, { email, name });

    //create new user on database
    const hashedPassword = await hashPassword(password);
    await User.create({
      name,
      email,
      password: hashedPassword,
    });
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred!" });
  }
};

const verify = async (req, res) => {
  const { token } = req.query;
  try {
    Jwt.verify(token, process.env.VERIFY_TOKEN_SECRET, async (err, decoded) => {
      if (err)
        return res
          .status(410)
          .json({ message: "verification code has expired or invalid" });

      await User.update(
        { verified: true },
        {
          where: {
            email: decoded.email,
            verified: false,
          },
        }
      );
      return res.status(200).json({ message: "Email verified successfully" });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred!" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email, verified: true } });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password!" });
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: "Invalid email or password!" });

    const payload = {
      id: user.id,
      role: user.role,
      email: user.email,
    };
    const accessToken = await generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    const expiresIn = parseInt(process.env.REFRESH_TOKEN_EXPIRES);
    const expiresAt = moment()
      .add(expiresIn, "seconds")
      .format("YYYY-MM-DD HH:mm:ss");
    saveRefreshToken(user.id, refreshToken, 'refresh', expiresAt);

    return res
      .status(200)
      .cookie("accessToken", accessToken, {
        maxAge: process.env.ACCESS_TOKEN_EXPIRES * 1000,
        httpOnly: true,
        secure: true,
      })
      .cookie("refreshToken", refreshToken, {
        maxAge: process.env.REFRESH_TOKEN_EXPIRES * 1000,
        httpOnly: true,
        secure: true,
      })
      .json({ message: "Login successful" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

const logout = async (req, res) => {
  const refreshToken = req.headers.authorization;
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
    let token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No refresh token provided!" });
    }
    token = token.split(" ")[1];
    const refreshToken = await Token.findOne({ where: { token } });
    if (!refreshToken)
      return res
        .status(401)
        .json({ message: "Refresh token is invalid or has expired!" });

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

export { register, login, logout, refresh, verify };
