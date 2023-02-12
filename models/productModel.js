const mongoose=require("mongoose")
const productSchema = new mongoose.Schema({
   name: {
     type: String,
     required: true
   },
   description: {
     type: String,
     required: true
   },
   sell: {
     type: Number,
     required: true
   },
   cost: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
   iBlocked:{
    type:Boolean,
    default:true
   
}, 
   category: {
     type: mongoose.Schema.Types.ObjectId,
  
   },
   image_url: { type: [String], required: true}

},  

 {timestamps:true})
 

const Product = mongoose.model('Product', productSchema);
 module.exports=Product;



