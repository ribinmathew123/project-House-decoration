const mongoose=require("mongoose")
const productSchema = new mongoose.Schema({
   name: {
     type: String,
   },
   description: {
     type: String,
   },
   sell: {
     type: Number,
   },
   cost: {
    type: Number,
  },
  quantity: {
    type: Number,
  },
  firstQuantity: {
    type: Number,
  },
  
   iBlocked:{
    type:Boolean,
    default:true
   
}, 
   category: {
     type: mongoose.Schema.Types.ObjectId,
  
   },
   image_url: { type:Array}

},  

 {timestamps:true})
 

const Product = mongoose.model('Product', productSchema);
 module.exports=Product;



