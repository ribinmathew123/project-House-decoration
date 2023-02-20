const { name } = require("ejs");
const express = require("express");
const mongoose = require("mongoose");
const Category = require("../models/categoryModel");
const productModel = require("../models/productModel");
const userdata = require("../models/userModel");
const cartmodel = require("../models/cart");
const orderModel = require("../models/orderModel");
const couponmodel=require("../models/couponModel")
const wishlistData=require("../models/wishlistModel")
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
    .catch((error) => {
      req.session.error = " Already Exits";

      console.log(error);
    });
};



const getAddProductPage = (req, res) =>
  Category.find()
    .then((categories) => {
      const catData = { edit: false, categories, name: "Add Product" };

      res.render("../views/admin/product.ejs", { catData });
    })
    .catch((error) => {
      console.log(error);
    });


const postproduct = async (req, res) => {
  try {
    let images = [];

    if (req.files) {
      for (let i = 0; i < req.files.length; i++) {
        const file = dUri.format(
          path.extname(req.files[i].originalname).toString(),
          req.files[i].buffer
        ).content;

        const result = await uploader.upload(file);
        images.push(result.url);
      }
    }

    const data = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category_id,
      image_url: images,
      quantity: req.body.quantity,
      sell: req.body.sell,
      cost: req.body.cost,
    };

    const Product = new productModel(data);
    await Product.save();
    res.redirect("/product/product-lists");
  } catch (error) {
    console.error(error);
  }
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
};

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



    if (check.status == true) {
      await Category.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: { status: false } }
      );
    } else {
      await Category.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: { status: true } }
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

// add to cart

const getAddToCartPage = async (req, res) => {
  try {
    // req.session.cartuserid = req.query.userid
    const email = req.session.userEmail;

    let userid = await userdata.findOne({ email: email });
    let userCart = await cartmodel.findOne({ userId: userid });
    // console.log(userCart);

    if (req.query?.productid && req.session.userEmail) {
      if (!userCart) {
        await cartmodel.insertMany([{ userId: userid }]);
        userCart = await cartmodel.findOne({ userId: userid });
      }
      let itemIndex = userCart.cartItems.findIndex((cartItems) => {
        return cartItems.productId == req.query.productid;
      });
      if (itemIndex > -1) {
        //-1 if no item matches
        await cartmodel.updateOne(
          { userId: userid, "cartItems.productId": req.query.productid },
          {
            $inc: { "cartItems.$.qty": 1 },
          }
        );
      } else {
        await cartmodel.updateOne(
          { userId: userid },
          {
            $push: { cartItems: { productId: req.query.productid, qty: 1 } },
          }
        );
      }
      res.redirect("/product/cartdataprint");
    }
  } catch (err) {
    console.log(err);
  }
};

const cartDisplyPage = async (req, res) => {
  const email = req.session.userEmail;

  const user = await userdata.findOne({ email: email });

  const userId = user._id;

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


  res.render("../views/user/cart.ejs", {
    cartList: cartList,
    userId: req.session.userEmail,
  });
};




const removeCartItemPage = async (req, res) => {
  try {

    // if( req.query.id==null)
    const id = req.query.id;

    cartmodel.updateOne(
      {},
      { $pull: { cartItems: { productId: id } } },
      function (err) {
        if (err) {
          console.error(err);
          res.status(500).send({ message: "Failed to remove item" });
        } else {
          console.log("Cart item with product id was deleted successfully.");
          res.status(200).send({ message: "Item removed successfully" });
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Failed to remove item" });
  }
};






const postCartIncDec = async (req, res, next) => {
  try {
    const type = req.params.type;
    const userId = req.body.user_id;
    const productId = req.body.product_id;


    let update = {};
    if (type === "inc") {
      update = { $inc: { "cartItems.$.qty": 1 } };
    } else if (type === "dec") {
      update = { $inc: { "cartItems.$.qty": -1 } };
    } else {
      return res
        .status(400)
        .json({
          error: "Invalid type parameter. Only 'inc' or 'dec' are allowed.",
        });
    }

    const result = await cartmodel.updateOne(
      { userId: userId, "cartItems.productId": productId },
      update
    );

    if (result.nModified === 0) {
      return res.status(404).json({ error: "Cart item not found." });
    }

    res.json({
      msg: "Cart item quantity updated successfully.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
};




// checkoutpage
const getCheckoutPage = async (req, res) => {
  try {
    const email = req.session.userEmail;
    const user = await userdata.findOne({ email: email });

    const userId = user._id;

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
    //  console.log("cartList: cart datas...................", cartList);


    cartList.forEach((item) => {
      console.log("item starting");
      console.log("Product Name : "+item.product.name );
      console.log("Product image : "+item.product.image_url[0] );
      console.log("quantity"+ item.cartItems.qty );
      console.log("Product ID:" + item.cartItems.productId );
      console.log("user ID:"+item.userId );


    });
    console.log("item ending");

    
    const totalAmount = cartList.reduce((total, item) => {
      return total + item.cartItems.qty * item.product.cost;
    }, 0);
    //  con
    const order = new orderModel({
      userId: userId,
      orderItems: cartList.map((item) => ({
        productId: item.product._id,
        quantity: item.cartItems.qty,
      })),
      totalPrice: totalAmount,
    });
    await order.save();
    

    // const order = new ordermodel({
    //   userId: item.userId,
    //   productId: item.cartItems.productId,
    //   productName: item.product.name,
    //   productImage: item.product.image_url[0],
    //   quantity: item.cartItems.qty
    // });
    
    // order.save((err) => {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     console.log("Order saved successfully");
    //   }
    // });
    // console.log("cartList:", cartList);



    res.render("../views/user/checkout.ejs", {
      cartList: cartList,
      userData: user,
      userId: req.session.userEmail,
    });
  } catch (error) {
    console.log(error);
  }
};

// const couponcheck = async (req, res) => {
//   try {
//     // console.log(req.body.inputValue);

//     const user = await userdata.findOne({ email: req.session.userEmail });
//     let userid = user._id;
//     console.log(userid + "gggggggggggggggggg");
//     const cartdata = await cartmodel.findOne({ userId: userid });
//     const checkcoupon = await couponmodel.findOne({
//       name: req.body.inputValue,
//     });
//     const checkcouponused = await couponmodel.findOne({
//       name: req.body.inputValue,
//       userdata: { $elemMatch: { userId: userid } },
//     });
//     const finded = await User.find({
//       coupondata: { $elemMatch: { coupons: req.body.inputValue } },
//     });
//     let exp = checkcoupon.expiredate;
//     let date = new Date().toJSON();
//     let total = parseInt(cartdata.totalPrice);
//     let minamound = parseInt(checkcoupon.minpurchaseamount);
//     if (checkcoupon != null) {
//       console.log("iam in");

//       if (date < exp.toJSON()) {
//         console.log("date is not expire");
//         if (finded == "") {
//           // if(cartdata.status == true){
//           // console.log(total);
//           // console.log(minamound);
//           if (total > minamound) {
//             console.log("total is more");
//           } else {
//             console.log(
//               "lesser than min amound" +
//                 (cartdata.totalPrice * checkcoupon.discount) / 100
//             );
//             let discoun =
//               (parseInt(cartdata.totalPrice) * parseInt(checkcoupon.discount)) /
//               100;
//             let discount = parseInt(cartdata.totalPrice) - parseInt(discoun);
//             console.log(discount);
//             await User.updateOne(
//               { _id: userdata._id },
//               {
//                 $push: { coupondata: { coupons: req.body.inputValue } },
//               }
//             );
//             console.log(userdata._id);

//             await cartmodel.updateOne(
//               { userId: userdata._id },
//               { $set: { discoundamount: discount } }
//             );
//           }
//         } else {
//           console.log("coupon is used");
//         }
//       } else {
//         console.log("created date is not reach");
//         console.log(expdate);
//       }
//     } else {
//       console.log("ther is no coupon");
//     }
//     // let a=10
//     // if(a===a){
//     let dis = cartdata.discoundamount;
//     res.json({ dis });

//     // const success= (req,res)=>{
//     // res.render('../views/payment/sucess.ejs')
//     // }
//   } catch (error) {
//     console.log(error);
//   }
// };

// const couponcheck = async (req, res) => {
//   try {
//     const user = await userdata.findOne({ email: req.session.userEmail });
//     const userid = user._id;
//     const cartdata = await cartmodel.findOne({ userId: userid });
//     const couponName = req.body.couponCode;
//     console.log(couponName+"coupon body");
//     const coupon = await couponmodel.findOne({ couponCode: couponName });

// console.log('====================================');
// console.log(coupon);
// console.log('====================================');
  
//     if (!coupon) {
//       console.log("Coupon not found");
//       res.status(400).json({ error: "Coupon not found" });
//       return;
//     }
//     if (coupon.expiredate < new Date()) {
//       console.log("Coupon has expired");
//       res.status(400).json({ error: "Coupon has expired" });
//       return;
//     }
//     if (cartdata.totalPrice < coupon.minpurchaseamount) {
//       console.log("Cart total price is below minimum purchase amount");
//       res.status(400).json({ error: "Cart total price is below minimum purchase amount" });
//       return;
//     }
//     const couponUser = coupon.userdata.find(u => u.userId === userid);
//     if (couponUser) {
//       console.log("Coupon has already been used by this user");
//       res.status(400).json({ error: "Coupon has already been used by this user" });
//       return;
//     }
//     const discount = (cartdata.totalPrice * coupon.discount) / 100;
//     const discountedPrice = cartdata.totalPrice - discount;
//     await cartmodel.updateOne({ userId: userid }, { $set: { discoundamount: discount } });
//     await couponmodel.updateOne({ _id: coupon._id }, { $push: { userdata: { userId } } });
//     console.log("Coupon applied successfully");
//     res.json({ success: true, discountedPrice });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };







const couponcheck = async (req, res) => {
  try {
    const couponCode = req.body.couponCode;
    console.log(couponCode);
    
    const coupon = await couponmodel.findOne({ couponCode: couponCode });
  
    console.log("coupon details start");

    console.log(coupon.endDate);

    console.log(coupon.minimumAmount);

    console.log("coupon details end");




    if (coupon) {
      console.log("Coupon found");
      res.status(200).json(coupon);

    } else {
      // Coupon not 
      console.log("Coupon not found");
      res.status(400).json({ error: "Coupon not found" });

    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};






// wishList

const userAddToWishlist= async (req, res) => {
  try {
    const email = req.session.userEmail;
    const user = await userdata.findOne({ email: email });
    const userId = user._id;
    let userWishlist = await wishlistData.findOne({ userId: userId });
    if (!userWishlist) {
      userWishlist = await wishlistData.create({ userId: userId });
    }
    const productId = req.query.productid;
    if (userWishlist.products.includes(productId)) {
      console.log('Product already exists in wishlist');
    } else {
      await wishlistData.updateOne({ userId: userId }, { $push: { products: productId } });
      console.log('Product added to wishlist');
    }

    res.redirect("/product/wish-list");
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};


// wishlist Display
const wishlistDisplyPage = async (req, res) => {
  const email = req.session.userEmail;

  const user = await userdata.findOne({ email: email });
  console.log(user);

  const userId = user._id;
  console.log(user._id);

  const cartList = await wishlistData.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $unwind: "$products",
    },
    {
      $lookup: {
        from: "products",
        localField: "products.productId",
        foreignField: "_id",
        as: "productData",
      },
    },
    {
      $unwind: "$productData",
    },
  ]);
console.log("55555555555555555555555555");
  console.log("cartList23423: ", cartList);
  console.log("55555555555555555555555555");

  res.render("../views/user/wishList.ejs"
  , {
    cartList: cartList,
    userId: req.session.userEmail,});
};













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
  getAddToCartPage,
  cartDisplyPage,
  removeCartItemPage,
  postCartIncDec,
  getCheckoutPage,
  couponcheck,
 wishlistDisplyPage,
  userAddToWishlist,
};
