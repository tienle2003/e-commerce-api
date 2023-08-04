import { cloudinary } from "../configs/cloudinary.config.js";

const uploadImage = async (path, options) => {
  try {
    const result = await cloudinary.uploader.upload(path, options);
    return result;
  } catch (error) {
    console.error("Error uploading image to Cloudinary!", error);
    throw error;
  }
};

const deleteImage = async (image) => {
  try {
    const publicId = image ? image.split("/").slice(-1)[0].split(".")[0] : null;
    if (publicId) await cloudinary.uploader.destroy(`avatar/${publicId}`);
  } catch (error) {
    console.error("Error deleting image to Cloudinary!", error);
    throw error;
  }
};

export { uploadImage, deleteImage };
