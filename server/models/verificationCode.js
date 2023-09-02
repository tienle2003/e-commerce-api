import sequelize from "../configs/configDatabase.js";
import { DataTypes } from "sequelize";

const verificationCode = sequelize.define(
  "verificationCode",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expiration_time: {
        type: DataTypes.BIGINT,
        allowNull: false,
    }
  },{
    timestamps: false,
    tableName: 'verification_codes'
  },
);


export default verificationCode;
