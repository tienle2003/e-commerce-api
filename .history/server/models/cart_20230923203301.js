import { DataTypes } from "sequelize";
import sequelize from "../configs/configDatabase.js";
import Product from "../models/product.js"
import User from "../models/user.js"

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
);

Cart.belongsTo(User, { foreignKey: "user_id", as: "user" });
Cart.belongsTo(Product, { foreignKey: "product_id", as: "product" });

export default Cart;
