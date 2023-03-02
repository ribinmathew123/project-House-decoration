const express = require("express");
const router = express.Router();
const admincontroller = require("../controllers/adminController");
const sessions = require("express-session");
const {
  adminSession,
  withOutAdminSession,
} = require("../middleware/adminSession");

router.get("/*", (req, res, next) => {
  console.log(req.session);
  next();
});
const upload = require("../util/multer");
const uploadbuffer = require("../util/multer");
router.get("/login", withOutAdminSession, admincontroller.adminLoginpage);
router.get("/", adminSession, admincontroller.adminhomepageload);
router.get("/logout", admincontroller.adminlogout);
router.get("/user-list", adminSession, admincontroller.getuserlistpage);

// router.get("/new-user", admincontroller.newUserLoad);

router.get("/user-lists", adminSession, admincontroller.blockuser);

router.post("/login", withOutAdminSession, admincontroller.adminverification);
router.post(
  "/product-edit/:product_id",
  adminSession,
  admincontroller.postproducteditpage
);
router.get("/product-edit", adminSession, admincontroller.getproducteditpage);
router.get("/coupon", adminSession, admincontroller.getCouponPage);
router.post("/coupon", adminSession, admincontroller.postCouponPage);
router.get("/couponData", adminSession, admincontroller.getCouponDisplayPage);
router.get("/coupon-edit", adminSession, admincontroller.getCouponEditPage);
router.post("/coupon-Edit", adminSession, admincontroller.postCouponEditPage);

router.get("/coupon-Delete", adminSession, admincontroller.getCouponDeletPage);

// display bannermanage
router.get("/adminbanner", adminSession, admincontroller.banner);

// addbanner
router.post("/adminbanner",upload.single("image"),  // it is for add multiple image for single image changr array to single
admincontroller.insertbanner
);
// banner block
router.get("/imageblock", adminSession, admincontroller.bannerblock);
router.get("/get-month-wise-data",admincontroller.dashBoardDataGet)


module.exports = router;
