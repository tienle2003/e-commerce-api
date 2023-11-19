import { cloudinary } from "../configs/cloudinary.config.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const uploadSingleImage = async (path, options) => {
  try {
    const result = await cloudinary.uploader.upload(path, options);
    return result;
    
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Error uploading image to Cloudinary!");
  }
};

const uploadMultipleImage = async (files, options) => {
  try {
    const imageUrlList = [];
    for (let i = 0; i < files.length; i++) {
      const path = files[i].path;
      const result = await cloudinary.uploader.upload(path, options);
      imageUrlList.push(result.secure_url);
    }
    if (imageUrlList.length === 0) return null;
    if (imageUrlList.length === 1) return imageUrlList[0];

    return imageUrlList;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Error uploading image to Cloudinary!");
  }
};

const deleteSingleImage = async (image, folderName) => {
  try {
    const publicId = image ? image.split("/").slice(-1)[0].split(".")[0] : null;
    if (publicId)
      await cloudinary.uploader.destroy(`${folderName}/${publicId}`);
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Error deleting image to Cloudinary!");
  }
};

const deleteMutipleImages = async (imageUrlList, folderName) => {
  try {
    if (!Array.isArray(imageUrlList))
      return deleteSingleImage(imageUrlList, folderName);
    const publicId = imageUrlList.map((imageUrl) => {
      return folderName + "/" + imageUrl.split("/").slice(-1)[0].split(".")[0];
    });
    await cloudinary.api.delete_resources(publicId);
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Error deleting image to Cloudinary!");
  }
};
export {
  uploadSingleImage,
  deleteSingleImage,
  uploadMultipleImage,
  deleteMutipleImages,
};
