import Jwt from "jsonwebtoken";


const verifyAccessToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided!" });
  const accessToken = authHeader.split(" ")[1];
  try {
    const decoded = Jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json(err);
  }
};

const verifyRefreshToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided!" });
  const refreshToken = authHeader.split(" ")[1];
  try {
    const decoded = Jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    throw err;
  }
};

const verifyUser = (req, res, next) => {
  verifyAccessToken(req, res, () => {
    if (req.user.role !== "user")
      return res
        .status(403)
        .json({ message: "Unauthorized: Only user is allowed!" });
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  verifyAccessToken(req, res, () => {
    if (req.user.role !== "admin")
      return res
        .status(403)
        .json({ message: "Unauthorized: Only admin is allowed!" });
    next();
  });
};


export {
  verifyAccessToken,
  verifyRefreshToken,
  verifyUser,
  verifyAdmin,
};
