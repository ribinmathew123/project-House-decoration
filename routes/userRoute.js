const express = require("express");
const router = express.Router();
const { noSession, userSession } = require("../middleware/userSession");

const sessions = require("express-session");
const usercontroller = require("../controllers/userController");

router.get("/signup", noSession, usercontroller.usersignup);

router.get("/", usercontroller.loadHome);

router.get("/logout", usercontroller.logout);

router.get("/verifyotp/:user_id", noSession, usercontroller.verifyotp);

router.get("/userlogin", noSession, usercontroller.userLogin);

router.get("/product-display", usercontroller.getallproductpage);

router.get(  "/product-details/:product_id",usercontroller.getproductdetailspage);

router.post("/userlogin", noSession, usercontroller.userVerification);

router.post("/signup", noSession, usercontroller.insertUserData);

router.post("/verify/:user_id", noSession, usercontroller.verify);

router.get("/user_profile", userSession, usercontroller.getuserProfilePage);

router.get("/edit-profile", userSession, usercontroller.getusereditProfilePage);
router.get("/profile-address", userSession, usercontroller.getProfileAddressPage);


router.post("/user_profiles/:Dataid",userSession,usercontroller.postusereditProfilePage);
router.get("/change-Password",userSession,usercontroller.getchangepasswordPage);
router.post("/change-Password",userSession,usercontroller.postChangePasswordPage);

router.post("/address",userSession,usercontroller.postAddressPage);
router.get("/getAddressDetails/:userid",userSession,usercontroller.fetchAddress)
router.post("/checkoutform",userSession,usercontroller.postAddress);



module.exports = router;
