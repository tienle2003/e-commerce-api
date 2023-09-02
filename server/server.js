import express from "express";
import cors from "cors";
import initRoutes from "./routes/index.js";
import sequelize from "../server/configs/configDatabase.js";
import dotenv from "dotenv";
dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cors());

initRoutes(app);

const start = async () => {
  try {
    await sequelize.sync({ force: false }); // Set `force` to true if you want to drop and re-create the tables on every server start
    console.log("Database and tables synced successfully");

    // Start the server
    app.listen(port, () => {
      console.log(`server listening on port ${port}`);
    });
  } catch (error) {
    console.log("Error starting the server:", error);
  }
};


start();
