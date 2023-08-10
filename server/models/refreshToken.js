import sequelize from "../configs/configDatabase.js";
import User from "./user.js";
import { DataTypes } from "sequelize";

const RefreshToken = sequelize.define("Refresh_Token", {
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
  timestamps: false,
});

export default RefreshToken;
