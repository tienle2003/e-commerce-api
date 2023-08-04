import sizeOf from "image-size";

const verifyImage = (req, res, next) => {
  if (req.file) {
    const allowedExtentions = ["jpg", "png", "gif"];
    const fileExtention = req.file
      ? req.file.originalname.split(".").pop().toLowerCase()
      : null;
    if (fileExtention && !allowedExtentions.includes(fileExtention))
      return res.status(400).json({ message: "Invalid file extention!" });

    const dimentions = sizeOf(req.file.path);
    if (dimentions.height > 2000 || dimentions.width > 2000)
      return res.status(400).json({ message: "Image size is too large!" });
  }

  next();
};

export default verifyImage
