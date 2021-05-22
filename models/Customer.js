const mongoose = require('mongoose');

const customerSchema = {
  name: String,
  email: String,
  telephone: String,
  addres: String,
  pib: String,
  password: String
}

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
