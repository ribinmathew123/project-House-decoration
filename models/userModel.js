const mongoose=require('mongoose');
const bcrypt = require('bcrypt');

const saltRounds = 10;
const otpSchema=new mongoose.Schema
({
expiredAt:{type:Date},
otp:{type:Number}

})
const userSchema=new mongoose.Schema
({
   name:  String,
   email: String,
   phone:Number,
   password:String, otp:otpSchema,

   isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: true,
    },

   iBlocked:{
     type:Boolean,
     default:true
    
 }, 

 coupondata:[{
   coupons:String
  }],
 

 
 addressDetails:[
  {
   Fullname:{type:String},

   email:{type:String},

   mobile:{type:Number},

   countryname:{type:String},

   city:{type:String},
   
   company:{type:String},

   state:{type:String},

   postal_code:{type:Number},

   houseaddress:{
      type:String
   },
  }
],      },

 

 {timestamps:true})
 

 const User = mongoose.model('User', userSchema);
 module.exports=User;

