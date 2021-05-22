const mongoose = require('mongoose');

const messageSchema = {
  name: String,
  email: String,
  telephone: String,
  content: String,
  read: Boolean
}

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
