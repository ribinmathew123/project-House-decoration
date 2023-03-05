const mongoose=require('mongoose');
const categorySchema = new mongoose.Schema({

  name: {
    type:String,
    require: true, unique: true ,
  },

  status:{
    type:Boolean,
  
    default:true
},
});
const category = mongoose.model('Category', categorySchema);

module.exports=category;