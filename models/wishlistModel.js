const mongoose=require('mongoose')

const WishlistSchema=new mongoose.Schema({
    userId:{type:mongoose.Types.ObjectId},

    products:[
        { type:mongoose.Types.ObjectId}]
})
const wishlist= mongoose.model('wishlist',WishlistSchema)

module.exports=wishlist