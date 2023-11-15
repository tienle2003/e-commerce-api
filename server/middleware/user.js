import sizeOf from "image-size";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/apiError.js";

const verifyImage = (req, res, next) => {
  const allowedExtentions = ["jpg", "png", "gif"];
  const maxDimentions = { height: 2000, width: 2000 };
  let fileExtention = null;
  let dimentions;

  const verifySingleImage = (file) => {
    fileExtention = file.originalname.split(".").pop().toLowerCase();
    if (!allowedExtentions.includes(fileExtention))
      return `Invalid file extension: ${file.originalname}`;

    dimentions = sizeOf(file.path);
    if (
      dimentions.height > maxDimentions.height ||
      dimentions.width > maxDimentions.width
    )
      return `Image size is too large: ${file.originalname}`;
    return null;
  };

  if (req.file) {
    const singleImageError = verifySingleImage(req.file);
    if (singleImageError)
      throw new ApiError(StatusCodes.BAD_REQUEST, singleImageError);
  }

  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      const singleImageError = verifySingleImage(req.files[i]);
      if (singleImageError)
        throw new ApiError(StatusCodes.BAD_REQUEST, singleImageError);
    }
  }

  next();
};

export default verifyImage;
