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
const uploadSingleImage = multer({ storage }).single("images");

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

  let categoryName = req.body.catname.trim();
  categoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

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
    });
};










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

        const result = await uploader.upload(file,{ transformation: [
            { width: 1125, height: 1500, gravity: "face", crop: "fill" },
          ]});
        images.push(result);
      }
    }

    const data = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category_id,
      image_url: images,
      quantity: req.body.quantity,
      firstQuantity:req.body.quantity,
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
//  insert image


// const postproduct = async (req, res) => {
//   console.log("dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
//   console.log('====================================');
//   console.log(req.body);
//   console.log('====================================');

//   console.log("data11111111");
//   if (req.files) {
//     try {
//       // cloudinary
//       console.log("data22222211111111");

//       const files = req.files;
//       console.log('====================================');
//       console.log(files);
//       console.log('====================================');
//       const promises = await files.map(file => {
//         return new Promise((resolve, reject) => {
//           cloudinary.uploader.upload(file.path, {
//             transformation: [
//               { width: 485, height: 485, gravity: "face", crop: "fill" },
//             ]
//           }, (error, result) => {
//             if (error) {
//               reject(error);
//             } else {
//               resolve(result);
//             }
//           });
//         });
//       });
//       console.log("data22222211111111");

//       Promise.all(promises)
//         .then(async (results) => {
//           const newProduct = new productModel({
//             name: req.body.name,
//             description: req.body.description,
//             category: req.body.category_id,
//             image_url: results.map(result => result.url), // Use the URLs returned by Cloudinary
//             quantity: req.body.quantity,
//             sell: req.body.sell,
//             cost: req.body.cost,
//           })
//           await newProduct.save() // Wait for the product to be saved before redirecting
//           console.log("data777777772222211111111");
//           res.redirect("/product/product-lists");
//         })
//     } catch (error) {
//       console.log(error.message);
//       res.redirect('/error')
//     }
//   }  
// };

// const productImageEdit = async (req, res) => {
//   console.log("dartttttttttt");
//   console.log(req.params.product_id);

//   try {
//     let images = [];
// console.log(req.file+"fileeeeeeeeee");
// console.log(req.body+"bodynnnnnnnnnnnnnnn");
//     if (req.file) {
//       // for (let i = 0; i < req.files.length; i++) {
//         const file = dUri.format(
//           path.extname(req.file.originalname).toString(),
//           req.file.buffer
//         ).content;

//         const result = await uploader.upload(file,{ transformation: [
//             { width: 1125, height: 1500, gravity: "face", crop: "fill" },
//           ]});
//         images.push(result);
//       }
//     // }

//     const data = {
//       image_url: images,

//     };
//     { _id:  req.body.id },
//     {
//       $set: {
//         image: results, 

//       }}
//     const Product = new productModel(data);
//     res.redirect("/product/product-lists");
//   } catch (error) {
//     console.error(error);
//   }
// };



const productImageEdit = async (req, res) => {
  try {
    // Get the public ID of the image from the request parameters
    const public_id  = req.params.public_id;
    const product_id  = req.params.product_id;
    console.log(req.file+"data file");


    // Check that an image file was uploaded
    if (!req.file) {
      throw new Error('No image file provided');
    }

    // Upload the image to Cloudinary
    const file = dUri.format(
      path.extname(req.file.originalname).toString(),
      req.file.buffer
    ).content;
    const result = await uploader.upload(file, {
      transformation: [{ width: 1125, height: 1500, gravity: "face", crop: "fill" }]
    });

    await productModel.updateOne(
      { _id: product_id, "image_url.public_id": public_id },
      {
        $set: {
          "image_url.$": result,
        },
      }
    );
    res.redirect("/product/product-lists");
  } catch (error) {
    console.error(error);
  }
};









const getcategorylist = async (req, res) => {
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
    $lookup: {
         from: "products",
           localField: "orderItems.productId",
          foreignField: "_id",
          as: "product",
        },
      },
    
   ]);
   console.log("orderList start")

console.log(orderList)
console.log("orderList end")

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
      const data = req.body;
      
      await orderModel.updateOne(
          

          { _id: id },
          {
            $set: {
              orderStatus: data.orderStatus,
                        paymentStatus: data.paymentStatus,
            }   
          }
      )
      res.redirect("/product/order-management");
  } catch (err) {
      // next(err)
      console.log(err);
  }
};




const getinventoryManagement=async(req,res)=>
{
try {

  const orderList = await orderModel.aggregate([
    {
    $lookup: {
         from: "products",
           localField: "orderItems.productId",
          foreignField: "_id",
          as: "product",
        },
      },
    
   ]);
   console.log("orderList start")

console.log(orderList)
console.log("orderList end")

  res.render("../views/admin/adminInventoryManagement.ejs", {
  orderList,
  });
} catch (error) {
  next(error);
}
};













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

          newOrder.save().then(async(data) => {
          req.session.orderedItems = null
          res.json({ status: true, message: "order placed" })
         await cartmodel.deleteMany({ userId: userId });

      }).catch(() => {
          res.json({
              status: false, message: "order not placed"
          })
      })
  } else {
      res.json({
          status: false, message: "order not placed"
      })
  }
} catch (err) {
  console.log(err);
}
}



















 const postproducteditpage = async (req, res) => {
 const product_id=req.params.id

  try {
    const userData = await productModel.findByIdAndUpdate(
      { _id: product_id},
      { $set: { name: req.body.name,  cost:req.body.cost, 
        quantity: req.body.quantity, 
        firstQuantity:req.body.quantity,
        sell: req.body.sell, 
        description: req.body.description } }
    );
    res.redirect("/product/product-lists");
  } catch (error) {
    console.log(error.message);
  }
};




// edit product
// const   postproducteditpage= async (req, res) => {
//   console.log(req.query + '1232322222222');
//   console.log(req.body);
//   try {
//   const files = req.files;
//   const promises = await files.map(async (file, index) => {
//     const checkedit = await Product.findById({ _id:  req.body.id });  
//     return new Promise( (resolve, reject) => {
//       cloudinary.uploader.upload(file.path,
//        {
//         public_id: checkedit.image[index].public_id, 
//       overwrite: true,
//         transformation: [
//           { width: 485, height: 485, gravity: "face", crop: "fill" },
//         ]
//       }
//       , (error, result) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve(result);
//         }
//       });
// });
// });
//   Promise.all(promises)
//     .then(async (results) => {
//         const checkedit = await Product.findById({ _id:  req.body.id });
//         await Product.updateOne(
//           { _id:  req.body.id },
//           {
//             $set: {
//               name: req.body.name,
//               description: req.body.description,
//               category: req.body.category,
//               image: results,           
//                  price: req.body.price,
//               quantity: req.body.quantity,
//             },
//           }
//         );
//       })
//     res.redirect("/adminproducts");
//   } catch (error) {
//     console.log(error.message);
//     res.redirect('/error')
//   }
// };

// const postproducteditpage = async (req, res) => {
//   console.log( req.body.id);
//   console.log(req.body);
//   try {
//     if (!req.files) {
//       throw new Error('No files uploaded');
//     }
//   const files = req.files;
//   console.log(req.files+"gggggggggggggggggggggggg");
//   const promises = await files.map(async (file, index) => {
//     const checkedit = await productModel.findById({ _id:  req.body.id });  
//     return new Promise( (resolve, reject) => {

//       cloudinary.uploader.upload(file.path,
//        {
//         public_id: checkedit.image[index].public_id, 
//       overwrite: true,
//         transformation: [
//           { width: 485, height: 485, gravity: "face", crop: "fill" },
//         ]
//       }
//       , (error, result) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve(result);
//         }
//       });
// });
// });
//   Promise.all(promises)
//     .then(async (results) => {
//         const checkedit = await productModel.findById({ _id:  req.body.id });
//         await Product.updateOne(
//           { _id:  req.body.id },
//           {
//             $set: {
//               image: results,           
//             },
//           }
//         );
//       })
//     res.redirect("/adminproducts");
//   } catch (error) {
//     console.log(error.message);
//     res.redirect('/error')
//   }
// };








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
  uploadSingleImage,
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
  paymentConfirm  ,
  postproducteditpage,
  getinventoryManagement,
  productImageEdit,

};
