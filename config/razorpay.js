
const instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.KEY_SECRET,
  });

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
  