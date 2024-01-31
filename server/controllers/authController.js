import bcrypt from "bcrypt";
import config from "../configs/config.js";
import Jwt from "jsonwebtoken";
import User from "../models/user.js";
import refreshToken from "../models/refreshToken.js";
import { sendVerifyEmail, sendResetPassword } from "../providers/nodemailer.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

import {
  deleteToken,
  generateAccessToken,
  generateVerifyEmailToken,
  generateResetPasswordToken,
  generateAuthToken,
  hashPassword,
} from "../services/tokenService.js";

const register = asyncWrapper(async (req, res) => {
  const { name, email, password } = req.body;
  //check email exists or not
  const existingUser = await User.findOne({
    where: {
      email: email,
    },
  });

  if (existingUser)
    throw new ApiError(StatusCodes.CONFLICT, "This email is aready in use!");

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

  res.status(StatusCodes.OK).json({ message: "Email sent successfully" });
});

const verify = asyncWrapper(async (req, res) => {
  const verifyEmailToken = req.query.token;
  Jwt.verify(
    verifyEmailToken,
    config.jwt.verifyTokenSecret,
    async (err, decoded) => {
      if (err)
        throw new ApiError(
          StatusCodes.GONE,
          "verification code has expired or invalid"
        );

      await User.update(
        { verified: true },
        {
          where: {
            email: decoded.email,
            verified: false,
          },
        }
      );
      res
        .status(StatusCodes.OK)
        .json({ message: "Email verified successfully" });
    }
  );
});

const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email, verified: true } });
  if (!user)
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password!");
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch)
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password!");

  const { accessToken, refreshToken } = await generateAuthToken(user);

  res
    .status(StatusCodes.OK)
    .cookie("accessToken", accessToken, {
      maxAge: config.jwt.accessTokenExpires * 1000,
      httpOnly: true,
      secure: true,
    })
    .cookie("refreshToken", refreshToken, {
      maxAge: config.jwt.refreshTokenExpires * 1000,
      httpOnly: true,
      secure: true,
    })
    .json({ message: "Login successful" });
});

const logout = asyncWrapper(async (req, res) => {
  const refreshToken = req.headers.authorization;
  if (!refreshToken || !refreshToken.startsWith("Bearer ")) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "No token provided!");
  }
  const token = refreshToken.split(" ")[1];
  await deleteToken(req.user.userId, token);
  res.status(StatusCodes.OK).json({ message: "Logout successful" });
});

const refresh = asyncWrapper(async (req, res) => {
  let token = req.headers.authorization;
  if (!token || !token.startsWith("Bearer ")) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "No refresh token provided!");
  }
  token = token.split(" ")[1];

  const refreshTokenDoc = await refreshToken.findOne({ where: { token } });
  if (!refreshTokenDoc)
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "Refresh token is invalid or has expired!"
    );

  Jwt.verify(
    refreshTokenDoc.token,
    config.jwt.refreshTokenSecret,
    async (err, decoded) => {
      if (err)
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          "Refresh token is invalid or has expired!"
        );
      const user = await User.findByPk(decoded.userId);
      const newAccessToken = generateAccessToken(user);
      res
        .status(StatusCodes.CREATED)
        .cookie("accessToken", newAccessToken, {
          maxAge: config.jwt.accessTokenExpires * 1000,
          httpOnly: true,
          secure: true,
        })
        .json({ message: "generate new access token success" });
    }
  );
});

const forgotPassword = asyncWrapper(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "email is required." });

  const user = await User.findOne({ where: { email } });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "user not found");

  const resetPasswordToken = await generateResetPasswordToken(user);

  await sendResetPassword(resetPasswordToken, { email, name: user.name });

  res.status(StatusCodes.OK).json({ message: "Email sent successfully" });
});

const resetPassword = asyncWrapper(async (req, res) => {
  const { password } = req.body;
  const resetPasswordToken = req.query.token;
  Jwt.verify(
    resetPasswordToken,
    config.jwt.resetTokenSecret,
    async (err, decoded) => {
      if (err) {
        throw new ApiError(StatusCodes.GONE, "token has expired or invalid");
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
      res
        .status(StatusCodes.OK)
        .json({ message: "Reset password successfully" });
    }
  );
});

export {
  register,
  login,
  logout,
  refresh,
  verify,
  forgotPassword,
  resetPassword,
};
