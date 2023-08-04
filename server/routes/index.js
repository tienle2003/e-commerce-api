import authRouter from "./auth.js";
import userRouter from "./user.js";
import ProductRouter from "./product.js";

const initRoutes = (app) => {
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/products", ProductRouter);
};

export default initRoutes;
