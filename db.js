const mongoose = require("mongoose");
require("dotenv").config();
const mongoUri = process.env.MONGO_URI;

const connectToMongo = () => {
  mongoose.connect(mongoUri);
};
module.exports = connectToMongo;
