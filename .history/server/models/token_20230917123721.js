import sequelize from "../configs/configDatabase.js";
import User from "./user.js";
import { DataTypes } from "sequelize";

const refreshToken = sequelize.define(
  "refreshToken",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'refresh_tokens'
    timestamps: false,
  }
);

export default refreshToken;
