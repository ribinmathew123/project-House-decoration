const express = require("express");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const cartmodel = require("../models/cart");
const bannermodel = require("../models/bannermodel")



const bcrypt = require("bcrypt");
const { sendOTPViaEmail } = require("../util/sendOtpViaEmail");
const { response } = require("express");
const sendOtpViaEmail = require("../util/sendOtpViaEmail");
const Product = require("../models/productModel");
const Categories = require("../models/categoryModel");
const orderModel=require("../models/orderModel")

// get user sign up page or keep section in home

const usersignup = async (req, res, next) => {
  if (req.body.username) {
    res.redirect("/home");
  } else {
    try {
      let error = req.session.error;
      let succ = req.session.succ;
      req.session.error = null;
      req.session.succ = null;

      res.render("../views/user/signup.ejs", { error });
    } catch (error) {
      next(error);
      console.log("error.message");
    }
  }
};

const insertUserData = async (req, res) => {
  const otpError = req.session.otpError;


  try {

    User.findOne({ email: req.body.email }).then((user) => {
      // console.log(user)
      if (user) {
        if (req.body.email === user.email) {
          req.session.error = "Email Already Exits";
          res.redirect("/signup");
        }
      } else {
        if (req.body.password) {
          bcrypt.hash(req.body.password, 10).then(async (hashedPasword) => {
            let user = new User({
              name: req.body.name,
              email: req.body.email,
              phone: req.body.phone,
              password: hashedPasword,
            });
            let savedUser = user.save();



            let otp;
            otp = Math.floor(Math.random() * 1000000);
            const email = req.body.email;
            console.log(otp);

            const emailStatus = await sendOtpViaEmail(email, otp, res);
            console.log(emailStatus);
            if (emailStatus) {
              User.findByIdAndUpdate(
                { _id: user._id },
                {
                  $set: {
                    "otp.expiredAt": new Date(Date.now() + 20 * 60 * 1000),
                    "otp.otp": otp,
                  },
                }
              ).then(() => {
                res.redirect("/verifyotp/" + user._id);
              });
            }
          });
        } else {
          throw new Error("Password is required");
        }
      }
    });
  } catch (err) {
    console.log("err");
  }
};




const verifyotp = (req, res) => {
  const otpError = req.session.otpError;
  req.session.otpError=null;

  res.render("../views/user/otp", { userId: req.params.user_id ,otpError});
};


const verify = async (req, res) => {
  try {
    const otp = parseInt(req.body.otp);
    console.log(otp);
    console.log("verify body otp");
    const user = await User.findOne({ _id: req.params.user_id });
    if (otp == user.otp.otp) {
      console.log("correct");
      req.session.userEmail = user.email;
      user.isVerified = true; // Mark the user as verified
      await user.save(); // Save the user's data to the database
      res.redirect("/");
    } else {
      req.session.otpError = "Invalid OTP. Please try again.";
      res.redirect(`/verifyotp/${req.params.user_id}`);
    }

    console.log("otp wrong");
  } catch (error) {
    console.log(error.message);
  }
};




const userLogin = async (req, res) => {
 
  try {
    res.render("../views/user/userLogin");
  } catch (error) {
    console.log(error.message);
  }
  // }
};

// user login check and go to user home page


const userVerification = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isVerified) {
      throw new Error("Email not verified");
    }

    if (user.iBlocked) {
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (isPasswordMatch) {
        req.session.userEmail = req.body.email;
        res.redirect("/");
      } else {
        throw new Error("Invalid password");
      }
    } else {
      throw new Error("User is blocked");
    }
  } catch (error) {
    console.log(error.message);
    res.render("../views/user/userLogin.ejs", {
      wrongs: error.message,
    });
  }
};











// load home page

const loadHome = async (req, res) => {
  req.session.userEmail;
  try {
    const bannerimg = await bannermodel.find({status:true});
    Product.find({}, (err, details) => {
      if (err) {
        console.log(err);
      } else {
        res.render("../views/user/userHome.ejs", { alldetails: details, banner: bannerimg });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

// resend otp

const resendotppage = async (req, res) => {
  const userId = req.params.user_id;
  const user = await User.findOne({ _id: req.params.user_id });
 const email=user.email

  try {

    let otp;
            otp = Math.floor(Math.random() * 1000000);
            console.log(otp);

            const emailStatus = await sendOtpViaEmail(email, otp, res);
            if (emailStatus) {
              User.findByIdAndUpdate(
                { _id: user._id },
                {
                  $set: {
                    "otp.expiredAt": new Date(Date.now() + 20 * 60 * 1000),
                    "otp.otp": otp,
                  },
                }
              ).then(() => {
                res.redirect("/verifyotp/" + user._id);
              });
            }
      
        else {
          throw new Error("Password is required");
        }
      
 
  } catch (err) {
    console.log("err");
  }
}
  






// user profile 

const getProfileAddressPage=async(req,res)=>{

  try {

    let email = req.session.userEmail;
    const userData = await User.findOne({ email: email });
    
   res.render("../views/user/useraddressprint.ejs", {
      login: req.session,
      userDatas: userData,
    });
    
  } catch (error) {
    console.log(error);
    
  }
}



// disply all product
const getallproductpage = async (req, res) => {
  try {
    const categoryData = await Categories.find({status:true}, { name: 1 });



    Product.find( req.query?.category ? { category: req.query.category } : null,
      (err, details) => {
        if (err) {
          console.log(err);
        } else {
          res.render("../views/user/shop.ejs", {
            alldetails: details,
            catData: categoryData,
          });
        }
      }
    );
  } catch (error) {
    console.log(error.message);
  }
};





const getproductdetailspage = async (req, res) => {
  console.log(req.params.product_id);

  try {
    Product.findById({ _id: req.params?.product_id }).then((product) => {
      res.render("../views/user/singleProductPage.ejs", {
        productDetails: product,
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};


// data
const getUserOrderPage=async(req,res)=>
{
  try {


  } catch (error) {
    console.log(error);
  }
}








// userProfile

const getuserProfilePage = async (req, res, next) => {
  try {
  
    let email = req.session.userEmail;
    const userData = await User.findOne({ email: email });
   
    const userId = userData._id;
    

    const orderList = await orderModel.aggregate([
      {
         $unwind: "$orderItems",
      },
     {
     $lookup: {
          from: "products",
            localField: "orderItems.productId",
           foreignField: "_id",
           as: "product",
         },
       },
      {
         $unwind: "$product",
       },
    ]);
    res.render("../views/user/userProfile", {
      login: req.session,
      userDatas: userData,orderList, 
      Dataid: userId,
    });
  } catch (error) {
    next(error);
  }
};







// edit user data
const postusereditProfilePage = async (req, res) => {
  try {

    await User.findByIdAndUpdate(
      { _id: req.params.Dataid },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
        },
      }
    );

    res.redirect("/user_profile");
  } catch (error) {
    console.log(error.message);
  }
};

const getchangepasswordPage = async (req, res) => {
  res.redirect("/user_profile");
};

// edit user password


const postChangePasswordPage = async (req, res) => {
  let email = req.session.userEmail;
  let currentPassword = req.body.current;
  const user = await User.findOne({ email: email });

  if (user) {
    bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
      if (err) {
        console.error(err);
        res.redirect("/change-password");
      }
      if (isMatch) {
        if (req.body.new === req.body.confirm) {
          bcrypt.hash(req.body.new, 10, async (err, hash) => {
            if (err) {
              console.error(err);
              res.redirect("/change-password");
            }
            await User.updateOne(
              { email: email },
              { $set: { password: hash } }
            );
            res.redirect("/change-password");
          });
        } else {
          console.log("New password and confirm password do not match.");
          res.redirect("/change-password");
        }
      } else {
        console.log("Incorrect current password.");
        res.redirect("/change-password");
      }
    });
  } else {
    console.error("User not found in the database.");
    res.redirect("/change-password");
  }
};




const getusereditProfilePage = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    if (userData) {
      let error = req.session.error;
      req.session.error = null;
      res.render("../views/user/userProfile.ejs", {
        userDatas: userData,
        Dataid: req.query.id,
      });
    }

   
  } catch (error) {
    console.log(error.message);
  }
};




const postAddressPage = async (req, res) => {
  let email = req.session.userEmail;
  try {
    let email = req.session.userEmail;
    await User.updateOne(
      { email: email },
      {
        $push: {
          addressDetails: {
            Fullname: req.body.name,
            mobile: req.body.mobile,
            company: req.body.company,
            email: req.body.email,
            countryname: req.body.country,
            city: req.body.town,
            state: req.body.state,
            houseaddress: req.body.address,
            postal_code: req.body.zip,
          },
        },
      }
    );

    res.redirect("/user_profile");
  } catch (error) {
    console.error(error);
  }
};






const updateAddressPage = async (req, res) => {
  const addressid = req.params.id;

  try {
    const email = req.session.userEmail;
    await User.updateOne(
      { email: email, "addressDetails._id": addressid },
      {
        $set: {
          "addressDetails.$.Fullname": req.body.name,
          "addressDetails.$.mobile": req.body.mobile,
          "addressDetails.$.company": req.body.company,
          "addressDetails.$.email": req.body.email,
          "addressDetails.$.countryname": req.body.country,
          "addressDetails.$.city": req.body.town,
          "addressDetails.$.state": req.body.state,
          "addressDetails.$.houseaddress": req.body.address,
          "addressDetails.$.postal_code": req.body.zip,
        },
      }
    );
    res.redirect("/user_profile");
  } catch (error) {
    console.error(error);
  }
};

const logout = async (req, res) => {
  req.session.userEmail = null;
  console.log("user session disstroyed");
  res.redirect("/userlogin");
  res.end();
};



const postAddress = async (req, res, next) => {
  try {
    
    let email = req.session.userEmail;
    const userData = await User.findOne({ email: email });
    res.render("../views/user/checkout.ejs", {
      login: req.session,
      userDatas: userData,
    });
  } catch (error) {
    next(error);
  }
};






const fetchAddress = async (req, res) => {
  try {
    const addressId = req.params.userid;
    const email = req.session.userEmail;
    const userData = await User.findOne({ email });
    const addressDetails = userData.addressDetails.id(addressId);
    if (!addressDetails) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json(addressDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  } 
}




const postCashonDelivery = async (req, res) => {
  try {
    const userId = req.query.userId;


    const cartList = await cartmodel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $unwind: "$cartItems",
      },
      {
        $lookup: {
          from: "products",
          localField: "cartItems.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
    ]);


    let orderId = 'HomeDEC00001';
    
    const newOrder = new orderModel({
      orderItems: cartList.map((item) => ({
        productId: item.product._id,
        quantity: item.cartItems.qty,
      })),
      products: req.session.orderedItems,
      totalPrice: req.body.amount,
      order_id: orderId, // use the generated orderId here
      name: req.body.name,
      shop: req.body.shop,
      state: req.body.state,
      city: req.body.city,
      street: req.body.street,
      code: req.body.code,
      mobile: req.body.mobile,
      email: req.body.email,
      paymentMethod: "COD",
    });


    await newOrder.save(); // save the new order to the database

    req.session.orderedItems = null;
      
    await cartmodel.deleteMany({ userId: userId });


    res.status(200).send({ orderId });
  } catch (err) {
    console.error(`Error Product Remove:`,err);
    res.status(500).send("Internal server error");
    res.redirect("/");
  }
};
















  

   

const userAddressDelete = async (req, res) => {
  try {
  const id = req.query.id;
  await User.updateOne(
  {},
  { $pull: { addressDetails: { _id: id } } }
  );
  console.log("Address deleted successfully.");
  res.status(200).redirect("/user_profile");
  } catch (error) {
  console.error(error);
  res.status(500).send("Error deleting address");
  }
  };
  



  const userAddressEdit = async (req, res) => {
    try {
      
      const addressId = req.query.addressId;
      const email = req.session.userEmail;
      const userData = await User.findOne({ email: email });
  
      const address = userData.addressDetails.find(
        (address) => address._id.toString() === addressId
      );
  
      res.render("../views/user/addressEditPage.ejs", {
        login: req.session,
        address: address,
      });
    } catch (error) {
      console.log(error);
    }
  };
  
const getforgotPasswordPage= async(req,res)=>{

  try {
    const errorData=req.session.er
    req.session.er=null
    res.render("../views/user/forgotPassMailPage.ejs",{errorData})
  } catch (error) {
    console.log(error);
  }
}







const postforgotPasswordPage = async (req, res) => {
  try {
    User.findOne({ email: req.body.email }).then(async(user) => {
      console.log(user);
      if (user) {
        if (req.body.email === user.email) {
            console.log("user found");
            // res.render("../views/user/forgotOtp.ejs" )
               const email= user.email
              let otp;
                      otp = Math.floor(Math.random() * 1000000);
                      console.log(otp);
          
                      const emailStatus = await sendOtpViaEmail(email, otp, res);
                      if (emailStatus) {
                        User.findByIdAndUpdate(
                          { _id: user._id },
                          {
                            $set: {
                              "otp.expiredAt": new Date(Date.now() + 20 * 60 * 1000),
                              "otp.otp": otp,
                            },
                          }
                        ).then(() => {
                          res.redirect("/verify-otp/"+user._id);
                        });
                      } 
                
                  else {
                    throw new Error("Password is required");
                  }
        }
      } else {
        req.session.er = "Email not found"
        console.log("user Notfound");

res.redirect("/forgot-password")      }
    });
  } catch (error) {
    console.log(error);
  }
};


const verifyOtp = (req, res) => {
  const otpError = req.session.otpError;
  req.session.otpError=null;

  res.render("../views/user/forgotOtp.ejs", { userId: req.params.user_id ,otpError});
};


const verifypassword= async (req, res) => {
  try {
    const otp = parseInt(req.body.otp);
    console.log(otp);
    console.log("verify body otp");
    const user = await User.findOne({ _id: req.params.user_id });
    if (otp == user.otp.otp) {
      console.log("correct password");
      res.render("../views/user/userPasswordChange.ejs",{ userId: req.params.user_id})

    
    } else {
      req.session.otpError = "Invalid OTP. Please try again.";
      res.redirect(`/verify-otp/${req.params.user_id}`);
    }

    console.log("otp wrong");
  } catch (error) {
    console.log(error.message);
  }
};






const getUserPasswordChange =async( req,res)=>
{
  try {
    res.render("../views/user/userPasswordChange.ejs")
  } catch (error) {
    
  }
}




const postuserChangePasswordPage = async (req, res) => {
  console.log("data");
  const user = await User.findOne({ _id: req.params.user_id });
  console.log(user.email);
    // Compare new password and confirm password
    if (req.body.new === req.body.confirm) {


      // Hash new password
      bcrypt.hash(req.body.new, 10, async (err, hash) => {
        if (err) {
          console.error(err);
          res.status(500).json({ success: false });
        }
        // Update user's password
        await User.updateOne(
          { email: user.email },
          { $set: { password: hash } }
        );
        console.log("password change");
        res.render("../views/user/userLogin.ejs")
      });
    } else {
      console.log("New password and confirm password do not match.");
      res.status(400).json({ success: false });
    }
  };
  
      

  






const codSuccessPage=async(req,res, next)=>{
  try {
    
    res.render("../views/user/successPage.ejs")
  } catch (error) {
    next(error)
 }
}






module.exports = {
  userVerification,
  userLogin,
  loadHome,
  logout,
  insertUserData,
  usersignup,
  verify,
  verifyotp,
  getallproductpage,
  getproductdetailspage,
  getuserProfilePage,
  getusereditProfilePage,
  getusereditProfilePage,
  postusereditProfilePage,
  getchangepasswordPage,
  postChangePasswordPage,
  postAddressPage,
  postAddress,
  getProfileAddressPage,
  fetchAddress,
  postCashonDelivery,
  getUserOrderPage,
  userAddressDelete,
  userAddressEdit,
  updateAddressPage,
  getforgotPasswordPage,
  postforgotPasswordPage,
  resendotppage,
  codSuccessPage,
  getUserPasswordChange,
  verifyOtp,verifypassword,
  postuserChangePasswordPage
};
