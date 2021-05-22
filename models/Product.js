const mongoose = require('mongoose');

const productSchema = {
  name: String,
  category: String,
  brand: String,
  price: Number,
  pricePDV: Number,
  imgUrl: String
}

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
