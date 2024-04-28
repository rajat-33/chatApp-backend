const mongoose = require("mongoose");
const { Schema } = mongoose;

const requestSchema = new Schema({
  sender: {
    type: String,
    required: true,
  },
  receiver: {
    type: String,
    required: true,
  },
  messages: {
    type: Array,
  },
});

const Request = mongoose.model("message", requestSchema);
Request.createIndexes();
module.exports = Request;
