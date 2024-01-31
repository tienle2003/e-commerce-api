import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import config from "./config.js";

cloudinary.config({
  cloud_name: config.cloudinary.name,
  api_key: config.cloudinary.key,
  api_secret: config.cloudinary.secret,
});

const storage = multer.diskStorage({});
const fileUploader = multer({ storage });

export { cloudinary, fileUploader };
