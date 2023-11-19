import User from "../models/user.js";
import bcrypt from "bcrypt";
import asyncWrapper from "../utils/asyncWrapper.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { hashPassword } from "../services/tokenService.js";
import {
  uploadSingleImage,
  deleteSingleImage,
} from "../providers/cloudinary.js";

const getUserByToken = asyncWrapper(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  res.status(StatusCodes.OK).json(user);
});

const updateUserByToken = asyncWrapper(async (req, res) => {
  const userId = req.user.userId;
  const { name, birthDate, address, phone } = req.body;
  let avatar = null;

  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });

  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");

  if (req.file) {
    const result = await uploadSingleImage(req.file.path, {
      folder: "avatar",
      resource_type: "image",
    });
    avatar = result.secure_url;
  }

  //delete old image on clound
  await deleteSingleImage(user.avatar);

  await user.update({
    name,
    avatar,
    birth_date: birthDate,
    address,
    phone,
  });

  res.status(StatusCodes.OK).json({ message: "Update sucess", data: user });
});

const changePassword = asyncWrapper(async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid)
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Incorrect current password!");

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
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
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  res.status(StatusCodes.OK).json(user);
});

const deleteUserById = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByPk(userId);

  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");

  //delete old image on cloud
  await deleteSingleImage(user.avatar, "avatar");

  await user.destroy();

  res.status(200).json({ message: "User deleted succesfully" });
});

const updateUserById = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const { name, birthDate, address, phone } = req.body;
  let avatar = null;

  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });

  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");

  if (req.file) {
    const result = await uploadSingleImage(req.file.path, {
      folder: "avatar",
      resource_type: "image",
    });
    avatar = result.secure_url;
  }

  //delete old image on clound
  await deleteSingleImage(user.avatar, "avatar");

  await user.update({
    name,
    avatar,
    birth_date: birthDate,
    address,
    phone,
  });
  
  res.status(StatusCodes.OK).json({ message: "Update sucess", data: user });
});

export {
  getUserByToken,
  updateUserByToken,
  changePassword,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserById,
};
