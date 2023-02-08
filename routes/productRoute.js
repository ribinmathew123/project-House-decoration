const express=require('express');
const router=express.Router();
const productController=require('../controllers/productController');
const sessions = require('express-session');
const {adminSession, withOutAdminSession,} = require("../middleware/adminSession");

const { noSession, userSession } = require("../middleware/userSession");







router.get('/category',productController.getProductCategoryPage)
router.get('/category-list',productController.getcategorylist)
router.get('/add-product',productController.getAddProductPage)
router.get('/product-lists',productController.getproductlistpage)

router.get('/category-lists',productController.blockcategory)
router.get('/product-list',productController.blockproduct)

router.post('/product-list',productController.uploadMiddleware,productController.postproduct)
// router.post('/product-list',productController.postproduct)
router.post('/category',productController.postaddcategorypage)
router.post('/upload', productController.uploadMiddleware);




router.get('/cartpage',userSession,productController.getAddToCartPage)
// router.get('/cartimc',userSession,productController.userAddFromCart)
// router.get('/cartdec',userSession,productController.userDeductFromCart)
 router.get('/cartdataprint',userSession,productController.cartdataprint)


module.exports = router;






