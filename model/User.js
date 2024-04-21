const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  connections: {
    type: Array,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("user", userSchema); //creating a model using a schema
User.createIndexes(); //creating unique id for searching
module.exports = User; //exporting a model
