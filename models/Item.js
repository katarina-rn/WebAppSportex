const mongoose = require('mongoose');

const itemSchema = {
  productId: Number,
  quantity: Number,
  name: String,
  price: Number
}

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
