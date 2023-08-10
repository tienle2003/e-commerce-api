// import Sequelize from "sequelize";
// import dotenv from "dotenv";
// dotenv.config();

// const sequelize = new Sequelize(
//   process.env.DB_SCHEMA,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     dialect: "mysql",
//     logging: false,
//   }
// );

// const connection = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("Connection has been established successfully.");
//   } catch (error) {
//     console.error("Unable to connect to the database:", error);
//   }
// };

// connection();

// export default sequelize;
import User from "./user.js";
import Review from "./review.js";
import Product from "./product.js";

Review.belongsTo(User, { foreignKey: "user_id", as: "user" });
Review.belongsTo(Product, { foreignKey: "product_id", as: "product" });

User.hasMany(Review, {foreignKey: "user_id", as: "reviews"})
