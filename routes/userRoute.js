const express = require("express");
const sessions = require("express-session");
const salesReport =require("../util/export")
const router = express.Router();
const { noSession, userSession } = require("../middleware/userSession");
const usercontroller = require("../controllers/userController");




router.get("/signup", noSession, usercontroller.usersignup);

router.get("/", usercontroller.loadHome);

router.get("/logout", usercontroller.logout);

router.get("/verifyotp/:user_id", noSession, usercontroller.verifyotp);

router.get("/userlogin", noSession, usercontroller.userLogin);

router.get("/product-display", userSession,usercontroller.getallproductpage);

router.get(  "/product-details/:product_id",userSession,usercontroller.getproductdetailspage);

router.post("/userlogin", noSession, usercontroller.userVerification);

router.post("/signup", noSession, usercontroller.insertUserData);

router.post("/verify/:user_id", noSession, usercontroller.verify);

router.get("/user_profile", userSession, usercontroller.getuserProfilePage);

router.get("/edit-profile", userSession, usercontroller.getusereditProfilePage);

router.get("/profile-address", userSession, usercontroller.getProfileAddressPage);

router.get("/verify-otp/:user_id", noSession, usercontroller.verifyOtp);

router.post("/verify-otp/:user_id", noSession, usercontroller.verifypassword);

router.post("/user_profiles/:Dataid",userSession,usercontroller.postusereditProfilePage);

router.get("/change-Password",userSession,usercontroller.getchangepasswordPage);

router.post("/change-Password",userSession,usercontroller.postChangePasswordPage);

router.post("/change-passwords/:user_id",usercontroller.postuserChangePasswordPage);

router.post("/address",userSession,usercontroller.postAddressPage);

router.post("/update-address/:id",userSession,usercontroller.updateAddressPage);

router.get("/getAddressDetails/:userid",userSession,usercontroller.fetchAddress)

router.post("/checkoutform",userSession,usercontroller.postAddress);

router.post("/cashon-delivery",userSession,usercontroller.postCashonDelivery)

router.get("/address-delete",userSession,usercontroller.userAddressDelete)

router.get("/address-edit",userSession,usercontroller.userAddressEdit)

router.get("/forgot-password",usercontroller.getforgotPasswordPage)

router.post("/forgot-password",usercontroller.postforgotPasswordPage)

router.post("/resend-otp/:user_id",usercontroller.resendotppage)

router.get("/exportorder", salesReport.exportorder);

router.get("/success-page/:user_id",usercontroller.codSuccessPage)

router.get("/password-change",usercontroller.getUserPasswordChange)


module.exports = router;
