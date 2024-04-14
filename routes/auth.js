const express = require("express");
const router = express.Router();
const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "AGoodGirlsGuideToMurder";

router.post("/signup", async (req, res) => {
  console.log(req.body);
  try {
    const salt = await bcrypt.genSalt(10);
    const securePassword = await bcrypt.hash(req.body.password, salt);
    const newUser = await User.create({
      name: req.body.name,
      userName: req.body.userName,
      password: securePassword,
    });
    await newUser.save();
    const data = {
      user: {
        userName: req.body.userName,
      },
    };
    const auth_token = jwt.sign(data, JWT_SECRET);
    res.send({ status: "success", auth_token: auth_token });
    // res.send("signup");
  } catch (e) {
    console.log(e.message);
    res.send({ status: "failed", msg: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  console.log(req.body);
  try {
    const user = await User.findOne({ userName: req.body.userName });
    console.log(user);
    const passCompare = await bcrypt.compare(req.body.password, user.password);
    console.log(passCompare);
    if (!passCompare) {
      throw new Error("incorrect password");
    }
    res.send("login successful!");
  } catch (e) {
    res.status(404).send("incorrect cred");
  }
});

module.exports = router;
