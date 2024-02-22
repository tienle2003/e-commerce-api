import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.js";

const createUser = async (email, userBody) => {
  const existingUser = await getUserByEmail(email);
  if (existingUser)
    throw new ApiError(StatusCodes.CONFLICT, "This email is aready in use!");
  const newUser = await User.create({ ...userBody });
  return newUser;
};


const getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });
  return user;
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });
  return user;
};

const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  await user.destroy();
  return user;
};

const userService = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};

export default userService;
