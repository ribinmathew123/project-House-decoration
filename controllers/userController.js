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
    }
  }
};




const insertUserData = async (req, res,next) => {
const otpError = req.session.otpError;
  try {
    User.findOne({ email: req.body.email }).then((user) => {
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
next(err)  }
};




const verifyotp = (req, res) => {
  const otpError = req.session.otpError;
  req.session.otpError=null;
  res.render("../views/user/otp", { userId: req.params.user_id ,otpError});
};


const verify = async (req, res,next) => {
  try {
    const otp = parseInt(req.body.otp);
    console.log(otp);
    const user = await User.findOne({ _id: req.params.user_id });
    if (otp == user.otp.otp) {
      req.session.userEmail = user.email;
      user.isVerified = true; 
      await user.save(); 
      res.redirect("/");
    } else {
      req.session.otpError = "Invalid OTP. Please try again.";
      res.redirect(`/verifyotp/${req.params.user_id}`);
    }
  } catch (error) {
    next(error)  }
};



const userLogin = async (req, res,next) => {
  try {
    res.render("../views/user/userLogin");
  } catch (error) {
    next (error);
  }
};


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

const loadHome = async (req, res,next) => {
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
next(error)  }
};

// resend otp

const resendotppage = async (req, res,next) => {
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
next(err)  }
}
  




// user profile 

const getProfileAddressPage=async(req,res,next)=>{

  try {

    let email = req.session.userEmail;
    const userData = await User.findOne({ email: email });
    
   res.render("../views/user/useraddressprint.ejs", {
      login: req.session,
      userDatas: userData,
    });
    
  } catch (error) {
next(error)    
  }
}





// // shop page
// const getallproductpage = async (req, res) => {
//   try {
//     console.log(req.query+"gggggggggggggggggggkkkkkkkkkkkkkk");

//     console.log(req.query.sort +"ttttttttttttttttttkk");

//     const perPage = 6;
//     const page = parseInt(req.query.page) || 1;
//     const sortOption = req.query.sort ;
//  console.log(sortOption+"kkkkkkkkkkkkkk");
//     const categoryData = await Categories.find({status:true}, { name: 1 });

//     const filter = {};
//     const category = req.query.category;
//     const searchKeyword = req.query.search || '';
//     if (category) {
//       filter.category = category;
//     }
//     if (searchKeyword) {
//       filter.name = { $regex: new RegExp(searchKeyword, 'i') };
//     }

//     let sort = {};
//     switch (sortOption) {
//       // case 'newness':
//       //   sort = { created_at: -1 };
//       //   break;
//       case 'low-to-high':
//         sort = { cost: 1 };
//         break;
//       case 'high-to-low':
//         sort = { cost: -1 };
//         break;
//       case 'name-ascending':
//         sort = { name: 1 };
//         break;
//       case 'name-descending':
//         sort = { name: -1 };
//         break;
//       default:
//         sort = { created_at: -1 };
//         break;
//     }

//     const totalCount = await Product.countDocuments(filter);
//     const totalPages = Math.ceil(totalCount / perPage);
//     const nextPage = (page < totalPages) ? page + 1 : null;
//     const prevPage = (page > 1) ? page - 1 : null;

//     const products = await Product.find(filter)
//       .sort(sort)
//       .skip((perPage * (page - 1)))
//       .limit(perPage);

//     res.render('../views/user/shop.ejs', {
//       alldetails: products,
//       catData: categoryData,
//       totalCount,
//       currentPage: page,
//       totalPages,
//       nextPage,
//       prevPage,
//       searchKeyword,
//       sortby: sortOption,
//       selectedCategory: category
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// };




const getallproductpage = async (req, res) => {
  try {
    const perPage = 6;
    const page = parseInt(req.query.page) || 1;
    const sortOption = req.query.sort || 'created_at';
    const categoryData = await Categories.find({ status: true }, { name: 1 });
    const filter = {};
    const category = req.query.category;
    const searchKeyword = req.query.search || '';
    
    if (category) {
      filter.category = category;
    }
    if (searchKeyword) {
      filter.name = { $regex: new RegExp(searchKeyword, 'i') };
    }

    let sort = {};
    switch (sortOption) {
      case 'low-to-high':
        sort = { cost: 1 };
        break;
      case 'high-to-low':
        sort = { cost: -1 };
        break;
      case 'name-ascending':
        sort = { name: 1 };
        break;
      case 'name-descending':
        sort = { name: -1 };
        break;
      default:
        sort = { created_at: -1 };
        break;
    }

    const countQuery = category ? { ...filter, category } : filter;
    const totalCount = await Product.countDocuments(countQuery);
    const totalPages = Math.ceil(totalCount / perPage);
    const nextPage = (page < totalPages) ? page + 1 : null;
    const prevPage = (page > 1) ? page - 1 : null;

    const products = await Product.find(filter)
      .sort(sort)
      .skip((perPage * (page - 1)))
      .limit(perPage);

    res.render('../views/user/shop.ejs', {
      alldetails: products,
      catData: categoryData,
      totalCount,
      currentPage: page,
      totalPages,
      nextPage,
      prevPage,
      searchKeyword,
      sortby: sortOption,
      selectedCategory: category
    });
  } catch (error) {
    console.log(error.message);
  }
};







const getproductdetailspage = async (req, res,next) => {

  try {
    Product.findById({ _id: req.params?.product_id }).then((product) => {
      res.render("../views/user/singleProductPage.ejs", {
         productDetails: product,
      });
    });
   
  } catch (error) {
next(error)  }
};



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


const postChangePasswordPage = async (req, res,next) => {
  try{
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
}
  catch(error){
    next (error)

  }
};






const getusereditProfilePage = async (req, res,next) => {
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
next(error)  }
};




const postAddressPage = async (req, res,next) => {
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
next(error)  }
};






const updateAddressPage = async (req, res,next) => {
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
next(error)  }
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






const fetchAddress = async (req, res ,next) => {
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
    next(error);
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
      order_id: orderId,
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
    await newOrder.save();
    for (const item of cartList) {
      await Product.updateOne(
        { _id: item.product._id },
        { $inc: { quantity: -item.cartItems.qty } }
      );
    }
    req.session.orderedItems = null;
    await cartmodel.deleteMany({ userId: userId });

    res.status(200).send({ orderId });
  } catch (err) {
    console.error(`Error Product Remove:`, err);
    res.status(500).send("Internal server error");
    res.redirect("/");
  }
};


   

const userAddressDelete = async (req, res,next) => {
  try {
  const id = req.query.id;
  await User.updateOne(
  {},
  { $pull: { addressDetails: { _id: id } } }
  );
  console.log("Address deleted successfully.");
  res.status(200).redirect("/user_profile");
  } catch (error) {
  res.status(500).send("Error deleting address");
  next(error)
  }
  };
  



  const userAddressEdit = async (req, res,next) => {
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
    next(error)  
  }
  };
  
const getforgotPasswordPage= async(req,res,next)=>{

  try {
    const errorData=req.session.er
    req.session.er=null
    res.render("../views/user/forgotPassMailPage.ejs",{errorData})
  } catch (error) {
next(error)  }
}



const postforgotPasswordPage = async (req, res,next) => {
  try {
    User.findOne({ email: req.body.email }).then(async(user) => {
      console.log(user);
      if (user) {
        if (req.body.email === user.email) {
            console.log("user found");
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
next(error)  }
};


  const verifyOtp = (req, res) => {
  const otpError = req.session.otpError;
  req.session.otpError=null;
  res.render("../views/user/forgotOtp.ejs", { userId: req.params.user_id ,otpError});
     };



const verifypassword= async (req, res,next) => {
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
next(error)  }
};




const getUserPasswordChange =async( req,res)=>
{
  try {
    res.render("../views/user/userPasswordChange.ejs")
  } catch (error) {
    
  }
}





const postuserChangePasswordPage = async (req, res, next) => {
  try{

    const user = await User.findOne({ _id: req.params.user_id });
    console.log(user.email);
    if (req.body.new === req.body.confirm) {
      bcrypt.hash(req.body.new, 10, async (err, hash) => {
        if (err) {
          console.error(err);
          res.status(500).json({ success: false });
        }
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
    }catch(error){
      next(error)
    }
  }
  
    

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
