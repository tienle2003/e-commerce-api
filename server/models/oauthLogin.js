import sequelize from "../configs/configDatabase.js";
import { DataTypes } from "sequelize";

const oauthLogin = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    provider_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    provider: {
      type: DataTypes.ENUM,
      allowNull: false,
      defaultValue: "google",
      values: ["google", "facebook"],
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM,
      allowNull: false,
      defaultValue: "user",
      values: ["user", "admin"],
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    birth_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'aouth_logins',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default oauthLogin;
