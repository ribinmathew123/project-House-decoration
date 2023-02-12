const mongoose = require('mongoose');
const { userAddToCart } = require('../controllers/productController');

const Adminproduct=require('../models/adminModel');
const userModel=require('../models/userModel')
const productModel=require('../models/productModel')



const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.SchemaTypes.ObjectId,
    },
    
    
    cartItems:[{
            productId:{
                type:mongoose.SchemaTypes.ObjectId,  required:true,
            },
            qty:{
                type:Number,
                required:true,
                default:1,
            },
    
        }],
        discoundamount:{
            type:Number
        },
        total: {
            type: Number,
        
          }
})


const Cart = mongoose.model('cart', cartSchema);
module.exports = Cart;