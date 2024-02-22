import User from "../models/user.js";
import bcrypt from "bcrypt";
import asyncWrapper from "../utils/asyncWrapper.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import {
  uploadSingleImage,
  deleteSingleImage,
} from "../providers/cloudinary.js";

import userService from "../services/userService.js";

const getCurrentUser = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const user = await userService.getUserById(userId);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  res.status(StatusCodes.OK).json(user);
});

const updateCurrentUser = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const { birthDate, ...other } = req.body;
  let avatar = null;

  let user = await userService.getUserById(userId);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  // delete old image on clound
  await deleteSingleImage(user.avatar, "avatar");

  if (req.file) {
    const result = await uploadSingleImage(req.file.path, {
      folder: "avatar",
      resource_type: "image",
    });
    avatar = result.secure_url;
  }

  user = await userService.updateUserById(userId, {
    ...other,
    birth_date: birthDate,
    avatar,
  });

  res.status(StatusCodes.OK).json({ message: "Update sucess", data: user });
});

const changePassword = asyncWrapper(async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  const user = await userService.getUserByEmail(email);
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid)
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Incorrect current password!");
  user.password = newPassword;
  user.save();
  res
    .status(StatusCodes.OK)
    .json({ message: "Password changed successfully!" });
});

const getAllUsers = asyncWrapper(async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ["password"] },
  });
  if (users.length === 0)
    throw new ApiError(StatusCodes.NOT_FOUND, "No users found!");
  res.status(StatusCodes.OK).json(users);
});

const getUserById = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  res.status(StatusCodes.OK).json(user);
});

const deleteUserById = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const deletedUser = await userService.deleteUserById(userId);

  //delete old image on cloud
  await deleteSingleImage(deletedUser.avatar, "avatar");

  res.status(200).json({ message: "User deleted succesfully" });
});

const updateUserById = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const { birthDate, ...other } = req.body;
  let avatar = null;

  let user = await userService.getUserById(userId);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  // delete old image on clound
  await deleteSingleImage(user.avatar, "avatar");

  if (req.file) {
    const result = await uploadSingleImage(req.file.path, {
      folder: "avatar",
      resource_type: "image",
    });
    avatar = result.secure_url;
  }

  user = await userService.updateUserById(userId, {
    ...other,
    birth_date: birthDate,
    avatar,
  });

  res.status(StatusCodes.OK).json({ message: "Update sucess", data: user });
});

export {
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserById,
};
