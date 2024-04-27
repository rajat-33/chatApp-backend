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
  isAnswered: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Request = mongoose.model("request", requestSchema);
Request.createIndexes();
module.exports = Request;
