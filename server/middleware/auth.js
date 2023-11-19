import Jwt from "jsonwebtoken";
import config from "../configs/config.js";
import ApiError from "../utils/ApiError.js";
import StatusCodes from "http-status-codes";

const verifyAccessToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      throw new ApiError(StatusCodes.UNAUTHORIZED, "No token provided!");
    const accessToken = authHeader.split(" ")[1];
    const decoded = Jwt.verify(accessToken, config.jwt.accessTokenSecret);
    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
};

const verifyRefreshToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      throw new ApiError(StatusCodes.UNAUTHORIZED, "No token provided!");
    const accessToken = authHeader.split(" ")[1];
    const decoded = Jwt.verify(accessToken, config.jwt.refreshTokenSecret);
    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
};

const verifyUser = (req, res, next) => {
  verifyAccessToken(req, res, (err) => {
    if (err) return next(err);

    if (req.user.role !== "user")
      return next(new ApiError(StatusCodes.FORBIDDEN, "Only user is allowed!"));
    
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  verifyAccessToken(req, res, (err) => {
    if (err) next(err);

    if (req.user.role !== "admin")
      next(new ApiError(StatusCodes.FORBIDDEN, "Only admin is allowed!"));
    
    next();
  });
};

export { verifyAccessToken, verifyRefreshToken, verifyUser, verifyAdmin };
