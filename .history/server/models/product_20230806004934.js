import { DataTypes } from "sequelize";
import sequelize from "./index.js";
import User from "./user.js"

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue:  0,
    },
    sold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // image: {
    //   type: DataTypes.JSON,
    //   allowNull: false,
    // }
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Product;
