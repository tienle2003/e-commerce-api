import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import User from "../models/user.js";
import refreshToken from "../models/refreshToken.js";
import { sendVerifyEmail, sendResetPassword } from "../providers/nodemailer.js";

import {
  deleteToken,
  generateAccessToken,
  generateVerifyEmailToken,
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
  } catch (error) {}
};

export { register, login, logout, refresh, verify };

// import bcrypt from "bcrypt";
// import Jwt from "jsonwebtoken";
// import User from "../models/user.js";
// import Token from "../models/token.js";
// import { sendVerifyEmail, sendResetPassword } from "../providers/nodemailer.js";

// import {
//   hashPassword,
//   deleteToken,
//   generateAccessToken,
//   generateAuthToken,
//   generateVerifyEmailToken,
// } from "../services/tokenService.js";
// import dotenv from "dotenv";
// dotenv.config();

// const register = async (req, res) => {
//   const { name, email, password } = req.body;
//   try {
//     //check email exists or not
//     const existingUser = await User.findOne({
//       where: {
//         email: email,
//       },
//     });

//     if (existingUser)
//       return res.status(409).json({ message: "This email is aready in use!" });

//     //create new user on database
//     const hashedPassword = await hashPassword(password);
//     await User.create({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     return res.status(200).json({ message: "Register successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "An error occurred!" });
//   }
// };

// const sendVerificationEmail = async (req, res) => {
//   const { name, email } = req.query;
//   try {
//     //generate new token
//     const verifyEmailToken = await generateVerifyEmailToken(email);
//     //Send the token to the email you just created
//     sendVerifyEmail(verifyEmailToken, { email, name });
//     return res.status(200).json({ message: "Email sent successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "An error occurred!" });
//   }
// };

// const verify = async (req, res) => {
//   const { token } = req.query;
//   try {
//     Jwt.verify(token, process.env.VERIFY_TOKEN_SECRET, async (err, decoded) => {
//       if (err)
//         return res
//           .status(410)
//           .json({ message: "verification code has expired or invalid" });

//       const tokenDoc = await Token.findOne({
//         where: { token },
//         type: "verifyEmail",
//         user_id: decoded.userId,
//       });

//       if (!tokenDoc) throw new Error("token not found");

//       await User.update(
//         { verified: true },
//         {
//           where: {
//             email: decoded.email,
//             verified: false,
//           },
//         }
//       );
//       await deleteToken(decoded.userId, token, "verifyEmail");
//       return res.status(200).json({ message: "Email verified successfully" });
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "An error occurred!" });
//   }
// };

// const login = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ where: { email, verified: true } });
//     if (!user)
//       return res.status(401).json({ message: "Invalid email or password!" });
//     const passwordMatch = await bcrypt.compare(password, user.password);
//     if (!passwordMatch)
//       return res.status(401).json({ message: "Invalid email or password!" });

//     const { accessToken, refreshToken } = await generateAuthToken(user);

//     return res
//       .status(200)
//       .cookie("accessToken", accessToken, {
//         maxAge: process.env.ACCESS_TOKEN_EXPIRES * 1000,
//         httpOnly: true,
//         secure: true,
//       })
//       .cookie("refreshToken", refreshToken, {
//         maxAge: process.env.REFRESH_TOKEN_EXPIRES * 1000,
//         httpOnly: true,
//         secure: true,
//       })
//       .json({ message: "Login successful" });
//   } catch (error) {
//     return res.status(500).json({ message: error });
//   }
// };

// const logout = async (req, res) => {
//   const refreshToken = req.headers.authorization;
//   if (!refreshToken || !refreshToken.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "No token provided!" });
//   }
//   const token = refreshToken.split(" ")[1];
//   try {
//     await deleteToken(req.user.userId, token, "refresh");
//     res.status(200).json({ message: "Logout successful" });
//   } catch (error) {
//     console.error("Error while deleting refresh token: ", error);
//     return res
//       .status(500)
//       .json({ message: "An error occurred during logout." });
//   }
// };

// const refresh = async (req, res) => {
//   try {
//     let token = req.headers.authorization;
//     if (!token || !token.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "No refresh token provided!" });
//     }
//     token = token.split(" ")[1];
//     const refreshToken = await Token.findOne({ where: { token } });
//     if (!refreshToken)
//       return res
//         .status(401)
//         .json({ message: "Refresh token is invalid or has expired!" });

//     Jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
//       if (err) throw err;
//       const newAccessToken = generateAccessToken(user);
//       res
//         .setHeader("Authorization", `Bearer ${newAccessToken}`)
//         .json({ message: newAccessToken });
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "An error occurred while refreshing token!" });
//   }
// };

// const forgotPassword = async (req, res) => {
//   try {
//   } catch (error) {}
// };
// const resetPassword = () => {};

// export { register, login, logout, refresh, verify, sendVerificationEmail };
