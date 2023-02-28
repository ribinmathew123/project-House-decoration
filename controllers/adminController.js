const express = require("express");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const couponModel = require("../models/couponModel");
const ordermodel=require("../models/orderModel")
const bcrypt = require("bcrypt");
const { render } = require("ejs");

// get admin loginpage
const adminLoginpage = async (req, res) => {
  res.render("../views/admin/adminlogin");
};
// adminverification

const adminverification = async (req, res, next) => {
  try {
    console.log(req.body);
    const email = req.body.email;
    const password = req.body.password;
    const admin = await Admin.findOne({ email: email });

    if (admin) {
      console.log(admin);
      if (email == admin.email && password == admin.password) {
        console.log(req.session);
        req.session.email = email;
        res.redirect("/admin");
      } else {
        res.render("../views/admin/adminLogin.ejs", {
          wrong: "Invalid Credentials",
        });
      }
    } else {
      res.render("../views/admin/adminLogin.ejs", { wrong: "Admin Not Found" });
    }
  } catch (error) {
    next(error);
  }
};

// loadadmin-Homepage
const adminhomepageload = async (req, res) => {
  
  // find order
  const order = await Product.find();
  // find order
  const boardorderdata = await ordermodel.find();
  // user
  const userdata = await User.find();
  // product count
  const productcount = await Product.find();
  // Return','Shipped', 'Placed', 'Delivered', 'Cancelled
const ordePending = await ordermodel.find({status:'pending'}).count()
const Return = await ordermodel.find({status:'return'}).count()
const shipped = await ordermodel.find({status:'shippid'}).count()
const Delivered = await ordermodel.find({status:'delivered'}).count()
const Cancelled = await ordermodel.find({status:'cancel'}).count()

let orderPerMonth=[]
    for (let i=0;i<12;i++){
        let numberOfOrders=await ordermodel.find({month:i}).count()
        orderPerMonth.push(numberOfOrders)
    }
console.log(orderPerMonth);

  res.render("../views/admin/adminHome.ejs", {  boardorderdata, order,userdata,productcount,ordePending,Return,shipped,Delivered,Cancelled,orderPerMonth })
};





// user list show

const getuserlistpage = async (req, res) => {
  try {
    User.find({}, (err, userdetails) => {
      if (err) {
        console.log(err);
      } else {
        res.render("../views/admin/admincustomerlist.ejs", {
          details: userdetails,
        });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const adminlogout = async (req, res) => {
  req.session.email = null;
  // req.session.destroy();
  res.redirect("/admin/login");
};
const newUserLoad = async (req, res) => {
  if (req.session.email) {
    try {
      let wrong = req.session.wrong;
      let wrongr = req.session.wrongr;
      req.session.wrong = null;
      req.session.wrongr = null;

      res.render("../views/admin/new-user", { wrong, wrongr });
    } catch (error) {
      console.log(error.message);
    }
  } else {
    res.redirect("/admin");
  }
};

const getproducteditpage = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await Product.findById({ _id: id });
    console.log(req.session.error);
    if (userData) {
      let error = req.session.error;
      req.session.error = null;
      res.render("../views/admin/updateproduct", {
        user: userData,
        error,
        productid: req.query.id,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const postproducteditpage = async (req, res) => {
  try {
    console.log(req.body.name);
    console.log(req.body.id);

    const userData = await Product.findByIdAndUpdate(
      { _id: req.params.product_id },
      { $set: { name: req.body.name,quantity:req.body.quantity,sell:req.body.sell,description:req.body.description } }
    );

    res.redirect("/product/product-lists");
  } catch (error) {
    console.log(error.message);
  }
};



// block user
const blockuser = async (req, res) => {
  try {
    const check = await User.findById({ _id: req.query.id });

    console.log(req.query);
    if (check.iBlocked == true) {
      await User.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: { iBlocked: false } }
      );
    } else {
      await User.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: { iBlocked: true } }
      );
    }
    res.redirect("/admin/user-list");
  } catch (error) {
    console.log(error.message);
  }
};

// coupon manage
const getCouponPage = async (req, res) => {
  try {
    res.render("../views/admin/couponPage.ejs");
  } catch (error) {
    console.log(error);
  }
};

const postCouponPage = async (req, res) => {
 

  const data = {
    couponName: req.body.couponName,
    description: req.body.des,
    couponCode: req.body.code,
    startDate: req.body.start,
    endDate: req.body.end,
    minimumAmount: req.body.mini,
    maximumAmount: req.body.max,
    discount: req.body.discount,
  };

  try {
    const coupon = new couponModel(data);
    await coupon.save();
    res.redirect("/admin/couponData");
  } catch (error) {
    console.log(error);
  }
};

const getCouponDisplayPage=async(req,res)=>{
try {
const couponData = await couponModel.find();
  res.render("../views/admin/couponDisplayPage",{couponData});
  
} catch (error) {
  console.log(error);
}
}

//cupon edit page
const getCouponEditPage=async(req,res)=>{
try {

  console.log(req.query.id)
const couponData=await couponModel.find({_id:req.query.id})
console.log(couponData);

  res.render("../views/admin/couponEditPage.ejs",{couponData})
} catch (error) {
  console.log(error);
}
}



const getCouponDeletPage=async(req,res)=>{
  try {
  
    console.log(req.query.id)
  const couponData = await couponModel.findByIdAndDelete({ _id: req.query.id });
  res.redirect("/admin/couponData");
  
  } catch (error) {
    console.log(error);
  }
  }











const postCouponEditPage=async(req,res)=>{

  try {
    console.log(req.query.id );

    const userData = await couponModel.findByIdAndUpdate({ _id: req.query.id },
      { $set: { 
        couponName: req.body.couponName,
        description: req.body.des,  
        couponCode: req.body.code,
        startDate: req.body.start,
        endDate: req.body.end,
        minimumAmount: req.body.mini,
        maximumAmount: req.body.max,
        discount: req.body.discount,} })
        res.redirect("/admin/couponData");


  } catch (error) {
    console.log(error);
    
  }
}








module.exports = {
  adminverification,
  adminLoginpage,
  newUserLoad,
  adminlogout,
  postproducteditpage,
  adminhomepageload,
  getuserlistpage,
  blockuser,
  getproducteditpage,
  getCouponPage,
  postCouponPage,
  getCouponDisplayPage,
  getCouponEditPage,
  postCouponEditPage,
  getCouponDeletPage
};
