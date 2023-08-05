import { cloudinary } from "../configs/cloudinary.config.js";

const uploadSingleImage = async (path, options) => {
  try {
    const result = await cloudinary.uploader.upload(path, options);
    return result;
  } catch (error) {
    console.error("Error uploading image to Cloudinary!", error);
    throw error;
  }
};

const deleteSingleImage = async (image, folderName) => {
  try {
    const publicId = image ? image.split("/").slice(-1)[0].split(".")[0] : null;
    if (publicId)
      await cloudinary.uploader.destroy(`${folderName}/${publicId}`);
  } catch (error) {
    console.error("Error deleting image to Cloudinary!", error);
    throw error;
  }
};

const uploadMultipleImage = async (files, options) => {
  try {
    const imageUrlList = [];
    for (let i = 0; i < files.length; i++) {
      console.log(files[i].path)
      const path = files[i].path;
      const result = await cloudinary.uploader.upload(path, options);
      imageUrlList.push(result.secure_url);
    }
    return imageUrlList;
  } catch (error) {
    console.error("Error uploading image to Cloudinary!", error);
    throw error;
  }
};

export { uploadSingleImage, deleteSingleImage, uploadMultipleImage };
