import authRouter from "./auth.js";
import userRouter from "./user.js";
import ProductRouter from "./product.js";
import reviewRouter from "./review.js";
import categoryRouter from "./category.js";
import cartRouter from "./cart.js";
import rateLimiter from "../middleware/rateLimiter.js";

const initRoutes = (app) => {
  app.use("/api/v1/auth", rateLimiter({ time: 60, limit: 5 }), authRouter);
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/products", ProductRouter);
  app.use("/api/v1/reviews", reviewRouter);
  app.use("/api/v1/categories", categoryRouter);
  app.use("/api/v1/carts", cartRouter);
};

export default initRoutes;
