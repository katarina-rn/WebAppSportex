const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    products: [
      {
        productId: String,
        name: String,
        quantity: Number,
        price: Number,
        total: Number
      }
    ],
    active: {
      type: Boolean,
      default: true
    },
    totalPrice: Number,
    modifiedOn: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);
module.exports = mongoose.model("Cart", cartSchema);
