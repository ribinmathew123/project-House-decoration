const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CartItem'
  }]
});

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
