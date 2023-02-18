const express=require('express');
const router=express.Router();
const productController=require('../controllers/productController');
const sessions = require('express-session');
const {adminSession, withOutAdminSession,} = require("../middleware/adminSession");

const { noSession, userSession } = require("../middleware/userSession");


router.get('/category',adminSession,productController.getProductCategoryPage)
router.get('/category-list',adminSession,productController.getcategorylist)
router.get('/add-product',adminSession,productController.getAddProductPage)
router.get('/product-lists',adminSession,productController.getproductlistpage)

router.get('/category-lists',adminSession,productController.blockcategory)
router.get('/product-list',adminSession,productController.blockproduct)

router.post('/product-list',adminSession,productController.uploadMiddleware,productController.postproduct)
// router.post('/product-list',productController.postproduct)
router.post('/category',adminSession,productController.postaddcategorypage)
router.post('/upload', adminSession,productController.uploadMiddleware);
router.post('/cartpage',userSession,productController.getAddToCartPage)
router.put('/removecart',userSession,productController.removeCartItemPage)
router.put('/increment-decrement-count/:type',userSession,productController.postCartIncDec)
router.get('/cartdataprint',userSession,productController.cartDisplyPage)
router.get('/checkout',userSession,productController.getCheckoutPage)
router.post('/couponcheck',userSession,productController.couponcheck)
router.get('/wish-list',userSession,productController.userAddToWishlist)
router.get('/wishlist-display',userSession,productController.wishlistDisplyPage)




module.exports = router;






