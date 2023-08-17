import { DataTypes } from "sequelize";
import sequelize from "../configs/configDatabase.js";
import Product from "./product.js";

const Category = sequelize.define(
  "Category",
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
  },
  {
    timestamps: false,
  }
);

Category.hasMany(Product, {
  foreignKey: "category_id",
  as: "products",
});

export default Category;
