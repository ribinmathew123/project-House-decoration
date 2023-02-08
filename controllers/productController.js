const { name } = require("ejs");
const express = require("express");
const mongoose = require("mongoose");
const Category = require("../models/categoryModel");
const productModel = require("../models/productModel");
const userdata = require("../models/userModel");
const cartmodel = require("../models/cart")
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const storage = multer.memoryStorage();

const DataUri = new require("datauri/parser");
const dUri = new DataUri();
const path = require("path");
const uploadMiddleware = multer({ storage }).array("images", 10);
const { cloudinaryConfig, uploader } = require("../config/cloudinary");
const getProductCategoryPage = (req, res) => {
  // catdata
  const catData = { name };

  res.render("../views/admin/productcategory.ejs", catData);
};


const postaddcategorypage = (req, res) => {
  const category = new Category({ name: req.body.catname });
  category
    .save()
    .then(() => {
      res.redirect("/product/category-list");
    })
    .catch((error) => {  req.session.error = " Already Exits";

      console.log(error);
    });
};

const getAddProductPage = (req, res) =>
  Category.find()
    .then((categories) => {
      console.log(categories);
      const catData = { edit: false, categories, name: "Add Product" };
      res.render("../views/admin/product.ejs", { catData });
    })
    .catch((error) => {
      console.log(error);
    });



const postproduct = async (req, res) => {
  let images=[];
  // console.log(req.files);
  // console.log(req.body);
  if (req.files) {
    for (let i = 0; i < req.files?.length; i++) {
      // console.log(req.files[i]);
      // console.log(req.files[i].originalname);
      const file = dUri.format(
        path.extname(req?.files[i]?.originalname).toString(),
        req.files[i].buffer
      ).content;
      await uploader.upload(file).then((result) => {
        const image = result.url;
        console.log(result);
        images.push(result.url)
      });
    }
  }
  const data = {
    name: req.body.name,
    description: req.body.description,
    category: req.body.category_id,
    image_url: images,
    quantity:req.body.quantity,
    sell:req.body.sell,
    cost:req.body.cost
  };
  // console.log(data);
  const Product = new productModel(data);

  Product.save()
    .then(() => {
      res.redirect("/product/product-lists");
    })
    .catch((error) => {
      console.log(error);
    });
};

const getcategorylist = async (req, res) => {
  // if (req.session.email) {
    try {
      Category.find({}, (err, userdetails) => {
        console.log(userdetails);
        if (err) {
          console.log(err);
        } else {
          res.render("../views/admin/admincategorytable.ejs", {
            details: userdetails,
          });
        }
      });
    } catch (error) {
      console.log(error.message);
    }
  } 
  





  

const getproductlistpage = async (req, res) => {
  
    try {
      productModel.find({}, (err, userdetails) => {
        if (err) {
          console.log(err);
        } else {
          res.render("../views/admin/productList.ejs", {
            details: userdetails,
          });
        }
      });
    } catch (error) {
      console.log(error.message);
    }
};



//  blockcategory,
const blockcategory = async (req, res) => {
  try {
    const check = await Category.findById({ _id: req.query.id });

    console.log(req.query);
    if (check.iBlocked == true) {
      await Category.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: { iBlocked: false } }
      );
    } else {
      await Category.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: { iBlocked: true } }
      );
    }
    res.redirect("/product/category-list");
  } catch (error) {
    console.log(error.message);
  }
};



//  blockcproduct,
const blockproduct = async (req, res) => {
  try {
    const check = await productModel.findById({ _id: req.query.id });

    console.log(req.query);
    if (check.iBlocked == true) {
      await productModel.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: { iBlocked: false } }
      );
    } else {
      await productModel.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: { iBlocked: true } }
      );
    }
    res.redirect("/product/product-lists");
  } catch (error) {
    console.log(error.message);
  }
};


const cartdataprint = async (req, res) => {
  const email = req.session.userEmail
  let userid = await userdata.findOne({ email: email })
  const proimg = await cartmodel.findOne({ userId: userid }).populate('cartItems.productId');

  // const proimg = await cartmodel.findOne({ userId: userid })
  //   .populate({ path: 'cartItems._id', model: 'Product' });
  res.render("../views/user/cart2.ejs", { proimg: proimg })
}


// cart

// const cartdataprint = async (req, res) => {
//   const email = req.session.userEmail
//   let userid = await userdata.findOne({ email: email })
//   const proimg = await cartmodel.findOne({ userId: userid }).populate('cartItems.productId');
//   res.render("../views/user/cart2.ejs", { proimg: proimg })
// }

// cart

async function getAddToCartPage(req, res) {
  // req.session.cartuserid = req.query.userid 
  const email = req.session.userEmail
  let userid = await userdata.findOne({ email: email })
  let userCart = await cartmodel.findOne({ userId: userid })
  console.log(userCart);
  if (!userCart) {
    await cartmodel.insertMany([{ userId: userid }])
    userCart = await cartmodel.findOne({ userId: userid })
  }
  let itemIndex = userCart.cartItems.findIndex((cartItems) => {
    return cartItems.productId == req.query.productid
  })
  if (itemIndex > -1) {//-1 if no item matches
    await cartmodel.updateOne({ userId: userid, 'cartItems.productId': req.query.productid },
      {
        $inc: { 'cartItems.$.qty': 1 }
      }
    )
  }
  else {
    await cartmodel.updateOne({ userId: userid },
      {
        $push: { cartItems: { productId: req.query.productid, qty: 1 } }
      }
    )
  }
  res.redirect('/product/cartdataprint')
}




module.exports = {
  getProductCategoryPage,
  blockproduct,
  getAddProductPage,
  getproductlistpage,
  postaddcategorypage,
  postproduct,
  getcategorylist,
  blockcategory,
  uploadMiddleware,
  getAddToCartPage,cartdataprint,
  
};
