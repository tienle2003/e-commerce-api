import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import User from "../models/user.js";
import refreshToken from "../models/refreshToken.js";
import { sendVerifyEmail, sendResetPassword } from "../providers/nodemailer.js";

import {
  deleteToken,
  generateAccessToken,
  generateVerifyEmailToken,
  generateResetPasswordToken,
  generateAuthToken,
  hashPassword,
} from "../services/tokenService.js";
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

    //create new user on database
    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    //generate new token
    const verifyEmailToken = await generateVerifyEmailToken(newUser);

    //Send the token to the email you just created
    sendVerifyEmail(verifyEmailToken, { email, name });

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred!" });
  }
};

const verify = async (req, res) => {
  const verifyEmailToken = req.query.token;
  try {
    Jwt.verify(
      verifyEmailToken,
      process.env.VERIFY_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          console.log(err);
          return res
            .status(410)
            .json({ message: "verification code has expired or invalid" });
        }

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
      }
    );
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

    const { accessToken, refreshToken } = await generateAuthToken(user);

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
    await deleteToken(req.user.userId, token);
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
    // const rftk = req.cookies.refreshToken;
    // console.log(rftk)
    let token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No refresh token provided!" });
    }
    token = token.split(" ")[1];

    const refreshTokenDoc = await refreshToken.findOne({ where: { token } });
    if (!refreshTokenDoc)
      return res
        .status(401)
        .json({ message: "Refresh token is invalid or has expired!" });
    Jwt.verify(
      refreshTokenDoc.token,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err)
          return res
            .status(401)
            .json({ message: "Refresh token is invalid or has expired!" });
        const user = await User.findByPk(decoded.userId);
        const newAccessToken = generateAccessToken(user);
        return res
          .status(200)
          .cookie("accessToken", newAccessToken, {
            maxAge: process.env.ACCESS_TOKEN_EXPIRES * 1000,
            httpOnly: true,
            secure: true,
          })
          .json({ message: "generate new access token success" });
      }
    );
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while refreshing token!" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ error: "email is required." });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "user not found" });

    const resetPasswordToken = await generateResetPasswordToken(user);

    await sendResetPassword(resetPasswordToken, { email, name: user.name });

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred!" });
  }
};

const resetPassword = async (req, res) => {
  const { password } = req.body;
  const resetPasswordToken = req.query.token;
  try {
    if (!password || !resetPasswordToken)
      return res.status(400).json({ error: "missing inputs" });
    Jwt.verify(
      resetPasswordToken,
      process.env.RESET_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return res
            .status(410)
            .json({ message: "token has expired or invalid" });
        }

        const hashedPassword = await hashPassword(password);
        await User.update(
          { password: hashedPassword },
          {
            where: {
              email: decoded.email,
              verified: true,
            },
          }
        );
        return res.status(200).json({ message: "Reset password successfully" });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred!" });
  }
};

export {
  register,
  login,
  logout,
  refresh,
  verify,
  forgotPassword,
  resetPassword,
};
