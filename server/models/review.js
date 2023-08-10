import { DataTypes } from "sequelize";
import sequelize from "../configs/configDatabase.js";
import User from "./user.js";
import Product from "./product.js";

const Review = sequelize.define("Review", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
});

Review.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

Review.belongsTo(User, { foreignKey: "user_id", as: "user" });

export default Review;
