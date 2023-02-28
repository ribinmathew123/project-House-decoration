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
const sharp = require("sharp")

const storage = multer.memoryStorage();
const Razorpay=require("razorpay")
const DataUri = new require("datauri/parser");
const dUri = new DataUri();
const path = require("path");
const uploadMiddleware = multer({ storage }).array("images", 10);
const { cloudinaryConfig, uploader } = require("../config/cloudinary");
const order = require("../models/orderModel");




const getProductCategoryPage = (req, res) => {
  // catdata
  const catData = { name };
  const errorData=req.session.error
  req.session.error=null
  res.render("../views/admin/productcategory.ejs",{ catData, errorData } );
}
const postaddcategorypage = (req, res) => {
  let categoryName = req.body.catname.trim(); // trim whitespace


  Category.findOne({ name: categoryName })
    .then(existingCategory => {
      if (existingCategory) {
        req.session.error = "Category already exists.";
        res.redirect("/product/category");
      } else {
        const category = new Category({ name: categoryName });
        category.save()
          .then(() => {
            res.redirect("/product/category-list");
          })
          .catch((error) => {
            console.log(error);
          });
      }
    })
    .catch((error) => {
      console.log(error);
      // Handle error checking if category exists
    });
};







// const postaddcategorypage = (req, res) => {
//   const category = new Category({ name: req.body.catname });


//   category
//     .save()
//     .then(() => {
//       res.redirect("/product/category-list");
//     })
//     .catch((error) => {
//       res.redirect("/product/category");

//       req.session.error = " Already Exits";


//       console.log(error);
//     });
// };


// image upload and crop using sharp library

// const postproduct = async (req, res) => {
//   try {
//     let images = [];

//     if (req.files) {
//       for (let i = 0; i < req.files.length; i++) {
//         const file = req.files[i].buffer;

//         // crop the image using sharp
//         const croppedImage = await sharp(file)
//           .resize({ width: 485, height: 485, fit: 'cover' })
//           .toBuffer();

//         // convert buffer to string
//         const imageString = croppedImage.toString();

//         // upload the cropped image to Cloudinary
//         const result = await uploader.upload(imageString);

//         images.push(result.url);
//       }
//     }

//     const data = {
//       name: req.body.name,
//       description: req.body.description,
//       category: req.body.category_id,
//       image_url: images,
//       quantity: req.body.quantity,
//       sell: req.body.sell,
//       cost: req.body.cost,
//     };

//     const Product = new productModel(data);
//     await Product.save();
//     res.redirect("/product/product-lists");
//   } catch (error) {
//     console.error(error);
//   }
// };






const getAddProductPage = (req, res) =>
  Category.find()
    .then((categories) => {
      const catData = { edit: false, categories, name: "Add Product" };

      res.render("../views/admin/product.ejs",{ catData });
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
const resp = cloudinary.uploader.upload(file,{ transformation: [
  { width: 485, height: 485, gravity: "face", crop: "fill" },
]})

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







const imageUpload = async (req, res) => {
  try {
    let images = [];

    if (req.files) {
      for (let i = 0; i < req.files.length; i++) {
        const file = dUri.format(
          path.extname(req.files[i].originalname).toString(),
          req.files[i].buffer
        ).content;
const resp = cloudinary.uploader.upload(file,{ transformation: [
  { width: 485, height: 485, gravity: "face", crop: "fill" },
]})

        const result = await uploader.upload(file);
        images.push(result.url);
      }
    }

    const data = {

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

const MAX_WORDS = 10; 
const getproductlistpage = async (req, res) => {
  try {
    productModel.find({}, (err, userdetails) => {
      if (err) {
        console.log(err);
      } else {

        const products = userdetails.map(product => {
          const words = product.description.split(' ');
          const truncatedWords = words.slice(0, MAX_WORDS);
          const truncatedDescription = truncatedWords.join(' ');
          return {
            ...product.toObject(),
            description: truncatedDescription
          }
        });

        res.render("../views/admin/productList.ejs", {
          details: products,
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
    res.render("../views/user/checkout.ejs", {
      cartList: cartList,
      userData: user,
      userId: userId,
    });
  } catch (error) {
    console.log(error);
  }
};




const postCheckoutPage = async (req, res) => {
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
   

    // console.log("item ending");
    // const totalAmount = cartList.reduce((total, item) => {
    //   return total + item.cartItems.qty * item.product.cost;
    // }, 0);
    // //  con

    // console.log(req.body.paymentMethod);

    // const order = new orderModel({
    //   userId: userId,
      

    //   orderItems: cartList.map((item) => ({
    //     productId: item.product._id,
    //     quantity: item.cartItems.qty,
    //   })),
    //   totalPrice: totalAmount,
    //   name: req.body.name,
    //   shop: req.body.shop,
    //   state: req.body.state,
    //   city: req.body.city,
    //   street: req.body.street,
    //   code: req.body.code,
    //   mobile: req.body.mobile,
    //   email: req.body.email,
    //   paymentMethod:req.body.paymentMethod
    // });
    // await order.save();
    
    res.render("../views/user/successPage.ejs", {
      cartList: cartList,
      userData: user,
      userId: req.session.userEmail,
    });
  } catch (error) {
    console.log(error);
  }
};





const getorderManagement=async(req,res)=>
{
try {

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
 

  res.render("../views/admin/adminOrderManagement.ejs", {
  orderList,
  });
} catch (error) {
  next(error);
}
};


// order status changing

const orderStatusChanging = async (req, res, next) => {
  try {
      const id = req.params.id;
      const productId = req.params.productId;
      const data = req.body;
      
     console.log(req.params.productId); 
     

    
      await orderModel.updateOne(
          

          { _id: id, "orderItems.productId": productId },
          {
            $set: {
              "orderItems.$.orderStatus": data.orderStatus
            }             //     orderStatus: data.orderStatus,
              //     paymentMethod: data.paymentStatus,
              
          }
      )
      res.redirect("/product/order-management");
  } catch (err) {
      // next(err)
      console.log(err);
  }
};




//           orderModel.aggregate([
//             {
//                 $lookup: {
//                     from: "products",
//                     localField: "orderItems.productId",
//                     foreignField: "_id",
//                     as: "product"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "userId",
//                     foreignField: "_id",
//                     as: "users"
//                 }
//             },
//             {
//                 $sort: {
//                     createdAt: -1
//                 }
//             }
//         ]).then((orderDetails) => {
//           console.log(orderDetails+"orderDetailsuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu");
//             res.render("../views/admin/adminOrderManagement.ejs", { orderDetails });
//         })
//     } 
    
//     catch (err) {  console.log(err);

//     }
// };







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
//     const couponCode = req.body.couponCode;
//     console.log(couponCode);
//    const user = await userdata.findOne({ email: req.session.userEmail });
//     let userid = user._id;
// console.log(userid+"kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");

    // const checkcouponused = await couponmodel.findOne({ couponCode: couponCode ,userdta:{ $elemMatch: { userId: userid }}});





    //  await userdata.updateOne(

    //                 { _id:userid },
    //                 {
    //                   $push: { coupondata: { coupons: req.body.inputValue } },
    //                 }
    //               );



    const couponcheck = async (req, res) => {
      try {
        const couponCode = req.body.couponCode;
        console.log(couponCode);
    
        const user = await userdata.findOne({ email: req.session.userEmail });
        const userId = user._id;
    
        const couponUsed = await couponmodel.findOne({
          couponCode: couponCode,
          user: { $elemMatch: { userId: userId } }
        });
    
        if (couponUsed) {
          res.status(400).send("Coupon has already been used.");
        } else {


          const coupon = await couponmodel.findOne({
            couponCode: couponCode,
          });
    
          res.status(200).json(coupon);
        }
    
      } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error.");
      }
    };
    
 


//     console.log(coupon.endDate);

//     console.log(coupon.minimumAmount);

//     console.log("coupon details end");

//     if (coupon) {
//       console.log("Coupon found");
//       console.log(coupon+"fffffffffffffffffffffffffffffffffffff");
//       res.status(200).json(coupon);

//     } else {
//       // Coupon not 
//       console.log("Coupon not found");
//       res.status(400).json({ error: "Coupon not found" });

//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };






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
  console.log("cartList23423: ", cartList);

  res.render("../views/user/wishList.ejs"
  , {
    cartList: cartList,
    userId: req.session.userEmail,});
};





const postOrderpage=async(req,res)=>
{
 const amount=req.body.amount
 console.log(amount);

const razorpayInstance = new Razorpay({ 
// key_id:process.env.KEY_ID,
key_id:"rzp_test_7gAGPftwtY20XB",
key_secret:"vtqqLXg2NsCftCLpYZShms7M"

})
razorpayInstance.orders.create({

amount:amount*100,
  currency:"INR"
},(err,order)=>{
  console.log(order)
  res.json({success:true,order,amount})
})
}


const paymentConfirm=async(req,res)=>
{
   const userId=req.body.userId
  try {
    const razorpayInstance = new Razorpay({
       key_id:"rzp_test_7gAGPftwtY20XB",
       key_secret:"vtqqLXg2NsCftCLpYZShms7M" 
    });
    const order = await razorpayInstance.orders.fetch(req.body.response.razorpay_order_id)
    if (order.status === 'paid') {


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
        const newOrder = new orderModel({

        // userId: req.session.user.userId
        orderItems: cartList.map((item) => ({
          productId: item.product._id,
          quantity: item.cartItems.qty,
        })),
            products: req.session.orderedItems,
            totalPrice: order.amount/100,
            order_id: req.body.response.razorpay_order_id,
            name: req.body.name,
            shop: req.body.shop,
            state: req.body.state,
            city: req.body.city,
            street: req.body.street,
            code: req.body.code,
            mobile: req.body.mobile,
            email: req.body.email,
            paymentMethod:req.body.statusdata
        })
        newOrder.save().then((data) => {

            req.session.orderedItems = null
            // console.log(data);

        })
        
        await cartmodel.deleteMany({ userId: userId });

    }
} catch (err) {
  console.log(err);
}
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
  getAddToCartPage,
  cartDisplyPage,
  removeCartItemPage,
  postCartIncDec,
  getCheckoutPage,
  couponcheck,
  wishlistDisplyPage,
  userAddToWishlist,
  postCheckoutPage,
  postOrderpage,
  getorderManagement, 
  orderStatusChanging,
  paymentConfirm
};
