import { StatusCodes } from "http-status-codes";

const errorHandler = (err, req, res, next) => {
  if (!err.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  const response = {
    code: err.statusCode,
    message: err.message || StatusCodes[err.statusCode],
    stack: err.stack,
  };

  res.status(response.code).json(response);
};

export default errorHandler