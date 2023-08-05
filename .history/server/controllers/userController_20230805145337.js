import User from "../models/user.js";
import bcrypt from "bcrypt";
import { hashPassword } from "../middleware/auth.js";
import { uploadImage, deleteImage } from "../services/cloudinaryService.js";

const getUserByToken = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ message: "User not found!" });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const updateUserByToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, birthDate, address, phone } = req.body;
    let avatar = null;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) return res.status(404).json({ message: "User not found!" });

    if (req.file) {
      const result = await uploadImage(req.file.path, {
        folder: "avatar",
        resource_type: "image",
      });
      avatar = result.secure_url;
    }

    //delete old image on clound
    await deleteImage(user.avatar);

    await user.update({
      name,
      avatar,
      birth_date: birthDate,
      address,
      phone,
    });
    console.log(user);

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    console.log(updatedUser)
    return res
      .status(200)
      .json({ message: "Update sucess", data: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "User not found!" });
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid)
      return res.status(401).json({ message: "Incorrect current password!" });

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.save();
    return res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Database query error!" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    if (users.length === 0)
      return res.status(404).json({ message: "No users found!" });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ message: "User not found!" });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);

    if (!user) return res.status(404).json({ message: "User not found!" });

    //delete old image on clound
    await deleteImage(user.avatar);

    await user.destroy();

    return res.status(200).json({ message: "User deleted succesfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, birthDate, address, phone } = req.body;
    let avatar = null;

    const user = await User.findByPk(userId);

    if (!user) return res.status(404).json({ message: "User not found!" });

    if (req.file) {
      const result = await uploadImage(req.file.path, {
        folder: "avatar",
        resource_type: "image",
      });
      avatar = result.secure_url;
    }

    //delete old image on clound
    await deleteImage(user.avatar);

    await User.update(
      {
        name,
        avatar,
        birth_date: birthDate,
        address,
        phone,
      },
      {
        where: {
          id: userId,
        },
      }
    );

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    return res
      .status(200)
      .json({ message: "Update sucess", data: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

export {
  getUserByToken,
  updateUserByToken,
  changePassword,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserById,
};
