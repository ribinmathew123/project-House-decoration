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
      }, orderStatus: {
        type: String,
        default: 'pending'
      },
    }],
   
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
    },

  
    name: {
      type: String,
    },

    shop: {
      type: String,
      
    },

    state: {
      type: String,

    },
    city: {
      type: String,

    },
    street: {
      type: String,

    },
   
    code: {
      type: Number,

    },
    mobile: {
      type: Number,

    },
    email: {
      type: String,
    },


    paymentMethod:{type:String},

    razor_pay_order_id:{
      type: String,
    }

    

  }, {
    timestamps: true
  });
  const order = mongoose.model('order', orderSchema);

module.exports=order; 
