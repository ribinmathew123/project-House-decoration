const express = require("express");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const couponModel = require("../models/couponModel");
const ordermodel = require("../models/orderModel")
const bannermodel = require("../models/bannermodel");

const bcrypt = require("bcrypt");
const { render } = require("ejs");


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



const dashBoardOrderStatus=async(req,res)=>{
try {

  const orderCounts = await ordermodel.aggregate([
    {
      $group: {
        _id: "$orderStatus",
        count: { $sum: 1 },
      },
    },
  ]);
  
  const counts = {};
  
  orderCounts.forEach(({ _id, count }) => {
    counts[_id] = count;
  });

  res.json({
    delivered: counts['delivered'] || 0, 
    pending: counts['pending'] || 0,
    outdelivery: counts['out for Delivery'] || 0,
    ship: counts['shipped'] || 0,
  });

} catch (error) {
  console.log(error);
}
}




// loadadmin-Homepage
const adminhomepageload = async (req, res) => {
  try {
  const orderData = await ordermodel.find();
  const userData = await User.find();
  const productData = await Product.find();
res.render("../views/admin/adminHome.ejs", {  orderData, userData, productData})
    
  } catch (error) {
    console.log(error);
    
  }

 
}

  
  
  
  

















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

const getCouponDisplayPage = async (req, res) => {
  try {
    const couponData = await couponModel.find();
    res.render("../views/admin/couponDisplayPage", { couponData });

  } catch (error) {
    console.log(error);
  }
}

//cupon edit page
const getCouponEditPage = async (req, res) => {
  try {

    console.log(req.query.id)
    const couponData = await couponModel.find({ _id: req.query.id })
    console.log(couponData);

    res.render("../views/admin/couponEditPage.ejs", { couponData })
  } catch (error) {
    console.log(error);
  }
}



const getCouponDeletPage = async (req, res) => {
  try {

    console.log(req.query.id)
    const couponData = await couponModel.findByIdAndDelete({ _id: req.query.id });
    res.redirect("/admin/couponData");

  } catch (error) {
    console.log(error);
  }
}






const postCouponEditPage = async (req, res) => {

  try {
    console.log(req.query.id);

    const userData = await couponModel.findByIdAndUpdate({ _id: req.query.id },
      {
        $set: {
          couponName: req.body.couponName,
          description: req.body.des,
          couponCode: req.body.code,
          startDate: req.body.start,
          endDate: req.body.end,
          minimumAmount: req.body.mini,
          maximumAmount: req.body.max,
          discount: req.body.discount,
        }
      })
    res.redirect("/admin/couponData");


  } catch (error) {
    console.log(error);

  }
}



// insert banner
const insertbanner = (req, res) => {
  try {
    let banner = new bannermodel({
      bannertext: req.body.bannertext,

      image: req.file.filename,
    });
    banner.save();
    res.redirect("/admin/adminbanner");
  } catch (error) {
    console.log(error.message);
  }
};

// display banner image
const banner = async (req, res) => {
  try {
    const bannerData = await bannermodel.find({});
    res.render("../views/admin/banner.ejs", {
      bannerData: bannerData,
    });


  } catch (err) {
    console.log(err.message);
  }
  console.log("reach");
};
// block banner image
const bannerblock = async (req, res) => {
  try {
    const check = await bannermodel.findById({ _id: req.query.id });

    if (check.status == true) {
      await bannermodel.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: { status: false } }
      );
    } else {
      await bannermodel.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: { status: true } }
      );
    }
    res.redirect("/admin/adminbanner");
  } catch (error) {
    console.log(error.message);
  }
};





const dashBoardDataGet = async (req, res) => {
  //month wise data
  const FIRST_MONTH = 1
  const LAST_MONTH = 12
  const TODAY = new Date()
  const YEAR_BEFORE = new Date(TODAY)
  YEAR_BEFORE.setFullYear(YEAR_BEFORE.getFullYear() - 1)
  console.log(TODAY, YEAR_BEFORE)
  const MONTHS_ARRAY = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const pipeLine = [{
    $match: {
      createdAt: { $gte: YEAR_BEFORE, $lte: TODAY }
    }
  },
  {
    $group: {
      _id: { year_month: { $substrCP: ["$createdAt", 0, 7] } },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { "_id.year_month": 1 }
  },
  {
    $project: {
      _id: 0,
      count: 1,
      month_year: {
        $concat: [
          { $arrayElemAt: [MONTHS_ARRAY, { $subtract: [{ $toInt: { $substrCP: ["$_id.year_month", 5, 2] } }, 1] }] },
          "-",
          { $substrCP: ["$_id.year_month", 0, 4] }
        ]
      }
    }
  },
  {
    $group: {
      _id: null,
      data: { $push: { k: "$month_year", v: "$count" } }
    }
  },
  {
    $addFields: {
      start_year: { $substrCP: [YEAR_BEFORE, 0, 4] },
      end_year: { $substrCP: [TODAY, 0, 4] },
      months1: { $range: [{ $toInt: { $substrCP: [YEAR_BEFORE, 5, 2] } }, { $add: [LAST_MONTH, 1] }] },
      months2: { $range: [FIRST_MONTH, { $add: [{ $toInt: { $substrCP: [TODAY, 5, 2] } }, 1] }] }
    }
  },
  {
    $addFields: {
      template_data: {
        $concatArrays: [
          {
            $map: {
              input: "$months1",
              as: "m1",
              in: {
                count: 0,
                month_year: {
                  $concat: [
                    { $arrayElemAt: [MONTHS_ARRAY, { $subtract: ["$$m1", 1] }] },
                    "-",
                    "$start_year"
                  ]
                }
              }
            }
          },
          {
            $map: {
              input: "$months2",
              as: "m2",
              in: {
                count: 0,
                month_year: {
                  $concat: [
                    { $arrayElemAt: [MONTHS_ARRAY, { $subtract: ["$$m2", 1] }] },
                    "-",
                    "$end_year"
                  ]
                }
              }
            }
          }
        ]
      }
    }
  },
  {
    $addFields: {
      data: {
        $map: {
          input: "$template_data",
          as: "t",
          in: {
            k: "$$t.month_year",
            v: {
              $reduce: {
                input: "$data",
                initialValue: 0,
                in: {
                  $cond: [
                    { $eq: ["$$t.month_year", "$$this.k"] },
                    { $add: ["$$this.v", "$$value"] },
                    { $add: [0, "$$value"] }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  {
    $project: {
      data: { $arrayToObject: "$data" },
      _id: 0
    }
  }]
  const userChart = await User.aggregate(pipeLine)
  const product = await Product.aggregate(pipeLine)
  const orderChart = await ordermodel.aggregate(pipeLine)

  res.json({

    userChart,
    product,
    orderChart
  })

}


module.exports = {
  adminverification,
  adminLoginpage,
  newUserLoad,
  adminlogout,
  adminhomepageload,
  getuserlistpage,
  blockuser,
  getproducteditpage,
  getCouponPage,
  postCouponPage,
  getCouponDisplayPage,
  getCouponEditPage,
  postCouponEditPage,
  getCouponDeletPage,
  insertbanner
  , bannerblock,
  banner,
   dashBoardDataGet,
   dashBoardOrderStatus,
};
