const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponName: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  couponCode: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  minimumAmount: {
    type: Number,
    required: true
  },
  maximumAmount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    required: true
  }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
