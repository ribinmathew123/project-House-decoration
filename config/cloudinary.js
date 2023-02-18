const { config, uploader } = require("cloudinary").v2;
const multer = require("cloudinary-multer");

const cloudinaryConfig = (req, res, next) => {
  config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
    // sign_url: process.env.CLOUDINARY_URL,
  });
  next();
};

module.exports = {
  cloudinaryConfig,
  uploader,
};
