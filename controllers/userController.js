const express = require("express");
const User = require("../models/userModel");
const mongoose = require("mongoose");

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
            console.log(user);
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
  res.render("../views/user/otp", { userId: req.params.user_id });
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
      res.redirect("/");
    } else {
      res.redirect("/verifyotp");
    }

    console.log("otp wrong");
  } catch (error) {
    console.log(error.message);
  }
};

const userLogin = async (req, res) => {
  // if (req.session.username) {
  //   res.redirect("/home");
  // } else {
  try {
    res.render("../views/user/userLogin");
  } catch (error) {
    console.log(error.message);
  }
  // }
};

// user login check and go to user home page

let user;
const userVerification = async (req, res) => {
  try {
    const emaill = req.body.email;
    const password = req.body.password;

    console.log(emaill);
    console.log(password);

    user = await User.findOne({ email: emaill });
    // console.log(user);
    if (user && user.iBlocked == true) {
      bcrypt
        .compare(password, user.password)
        .then((status) => {
          if (status) {
            console.log(status);
            req.session.userEmail = req.body.email;
            res.redirect("/");
          } else {
            res.render("../views/user/userLogin.ejs", {
              wrongs: "Invalid Credentials",
            });
          }
        })
        .catch((err) => {
          res.send(err);
        });
    } else {
      res.render("../views/user/userLogin.ejs", {
        wrongs: "Invalid Credentials",
      });
    }
  } catch (error) {
    console.log(error.message);
    //edit
    res.render("../views/user/userLogin.ejs", {
      wrongs: "Invalid Credentials",
    });
  }
};

// load home page

const loadHome = async (req, res) => {
  req.session.userEmail;
  try {
    Product.find({}, (err, details) => {
      // console.log(details);
      if (err) {
        console.log(err);
      } else {
        res.render("../views/user/userHome.ejs", { alldetails: details });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

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



// dissply all product
const getallproductpage = async (req, res) => {
  try {
    const categoryData = await Categories.find({}, { name: 1 });

    Product.find(
      req.query?.category ? { category: req.query.category } : null,
      (err, details) => {
        // console.log(details);
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
  console.log("data entering")
  try {
    let email = req.session.userEmail;

   
     const user = await  User.findOne({ email: email });
    
        const userId = user._id;
        console.log(userId);
    
         const orderList = await orderModel.aggregate([
         {
           $match: {
             userId: new mongoose.Types.ObjectId(userId),
           },
        },
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
        console.log("order start yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");


        console.log(orderList);
        console.log("order end hggggggggggggggggggggggggggggggggggggg");

        res.render("../views/user/userOrder.ejs", {
          // cartList: cartList,
          // userData: user,
          // userId: req.session.userEmail,
        });


  } catch (error) {
    console.log(error);
  }
}








// userProfile

const getuserProfilePage = async (req, res, next) => {
  try {
  
    let email = req.session.userEmail;
    const userData = await User.findOne({ email: email });
    const userId = user._id;

    const orderList = await orderModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
     },
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
     console.log("order start TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT");


     console.log(orderList);
     console.log("order end QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ");


    res.render("../views/user/userProfile", {
      login: req.session,
      userDatas: userData,orderList,
    });
  } catch (error) {
    next(error);
  }
};







// edit user data
const postusereditProfilePage = async (req, res) => {
  try {
    // console.log(req.body.name);
    // console.log(req.params.Dataid);

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

// console.log(user);

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
  // if (req.session.email) {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    // console.log(req.session.error);
    if (userData) {
      let error = req.session.error;
      req.session.error = null;
      res.render("../views/user/editUserPage", {
        userDatas: userData,
        Dataid: req.query.id,
      });
    }

    // else {
    //   res.redirect("/admin");
    // }
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

// const postuserProfilePage=async(req,res)=>{
// try {

//   let email=req.session.userEmail
//   const userdatas = await User.findOne({ email: email });
//   // let userid = userdatas._id
//       // console.log(orderdata);
//   // res.render("../views/user/userprofile.ejs",{userdatas,order})
// }

// catch (error) {
//   console.log(error);
// }

// }

//  user logout

const logout = async (req, res) => {
  req.session.userEmail = null;
  console.log("user session disstroyed");
  res.redirect("/userlogin");
  res.end();
};

const postAddress = async (req, res, next) => {
  try {
    // console.log(req.session);
    //  let userData= req.session
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
  console.log("fetch entering......................");
  const addressId=req.params.userid
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

  console.log("starting................"); 
  console.log(req.body); 

  const totalAmount = $('#total-amount').text();
  console.log( totalAmount);


  console.log(" body ending");
 
  try {
    const $ = cheerio.load('<span id="total-amount"><%=totalAmount%></span>');

    const totalAmount = $('#total-amount').text();
    console.log(totalAmount);



  } catch (error) {
    console.log(error);
    
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
  postCashonDelivery,getUserOrderPage,
};
