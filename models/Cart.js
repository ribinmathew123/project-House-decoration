const mongoose = require('mongoose');
const { userAddToCart } = require('../controllers/productController');

const Adminproduct=require('../models/adminModel');
const userModel=require('../models/userModel')
const productModel=require('../models/productModel')



const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'User'
    },
    


    
    products:[{
            productId:{
                type:mongoose.Types.ObjectId,
                ref:'Product',
            },
            qty:{
                type:Number,
                required:true,
                default:1,
            },
            total:{
                type:Number
            }
        }],
        totalPrice:Number,
        discoundamount:{
            type:Number
        }
})


const Cart = mongoose.model('cart', cartSchema);
module.exports = Cart;