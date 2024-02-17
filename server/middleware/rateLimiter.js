import { StatusCodes } from "http-status-codes";
import redisClient from "../configs/redis.js";
import ApiError from "../utils/ApiError.js";

const rateLimiter =
  ({ time, limit }) =>
  async (req, res, next) => {
    const ip =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress.slice(0, 9);

    const requests = await redisClient.incr(ip);
    if (requests === 1) {
      await redisClient.expire(ip, time);
    }

    if (requests > limit)
      next(
        new ApiError(
          StatusCodes.TOO_MANY_REQUESTS,
          "The client has sent too many requests in a given time"
        )
      );
    else next();
  };

export default rateLimiter;
