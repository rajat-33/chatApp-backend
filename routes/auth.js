const express = require("express");
const router = express.Router();
const User = require("../model/User");
const bcrypt = require("bcrypt");

router.post("/signup", async (req, res) => {
  console.log(req.body);
  const salt = await bcrypt.genSalt(10);
  const securePassword = await bcrypt.hash(req.body.password, salt);
  //   const passCompare = await bcrypt.compare(req.body.password, securePassword);
  //   console.log(passCompare);
  const newUser = await User.create({
    name: req.body.name,
    userName: req.body.userName,
    password: securePassword,
  });
  await newUser.save();
  res.send("signup");
});

module.exports = router;
