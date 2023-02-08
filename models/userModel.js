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
   iBlocked:{
     type:Boolean,
     default:true
    
 }, 
 addressDetails:[
  {
   housename:{
      type:String
   },
   area:{
      type:String
   },
   landmark:{
      type:String
   },
   district:{
      type:String
   },
   postoffice:{
      type:String
   },
   state:{
      type:String
   },
   pin:{
      type:String
   } 
  }
],                         },
 
 {timestamps:true})

 const User = mongoose.model('User', userSchema);
 module.exports=User;

