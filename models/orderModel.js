const mongoose=require('mongoose');
const Adminproduct=require('../models/adminModel');
const userModel=require('../models/userModel')
const productModel=require('../models/productModel')

const orderSchema = new mongoose.Schema({

  userId:{
    type:mongoose.SchemaTypes.ObjectId,
},
    orderItems: [{
      
        productId:{
          type:mongoose.SchemaTypes.ObjectId,  required:true,

      },
      quantity: {
        type: Number,
      }
    }],
    shippingAddress: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    itemsPrice: {
      type: Number,
    },
    shippingPrice: {
      type: Number,
    },
    totalPrice: {
      type: Number,
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: {
      type: Date
    },
    isDelivered: {
      type: Boolean,
      default: false
    },
    deliveredAt: {
      type: Date
    }
  }, {
    timestamps: true
  });
  const order = mongoose.model('order', orderSchema);

module.exports=order; 
