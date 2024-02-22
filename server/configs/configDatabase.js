import Sequelize from "sequelize";
import config from "./config.js";

const sequelize = new Sequelize(
  config.database.schema,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    dialect: "mysql",
    logging: false,
  }
);

const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    
  }
};

connection();

export default sequelize;