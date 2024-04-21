const express = require("express");
const router = express.Router();
const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "AGoodGirlsGuideToMurder";

router.post("/signup", async (req, res) => {
  console.log(req.body);
  try {
    const user = await User.findOne({ userName: req.body.userName });
    console.log(user);
    if (user) {
      throw new Error("This username has already been taken!");
    }
    const salt = await bcrypt.genSalt(10);
    const securePassword = await bcrypt.hash(req.body.password, salt);
    const newUser = await User.create({
      name: req.body.name,
      userName: req.body.userName,
      password: securePassword,
      isActive: true,
    });
    await newUser.save();
    const data = {
      user: {
        userName: req.body.userName,
      },
    };
    const auth_token = jwt.sign(data, JWT_SECRET);
    res.status(200).send({
      status: "success",
      userName: req.body.userName,
      auth_token: auth_token,
    });
    // res.send("signup");
  } catch (e) {
    console.log(e.message);
    res.status(400).send({ status: "failed", msg: e.message });
  }
});

router.post("/login", async (req, res) => {
  console.log(req.body);
  try {
    const user = await User.findOne({ userName: req.body.userName });
    console.log(user);
    if (!user) {
      throw new Error("incorrect credentials!");
    }
    const passCompare = await bcrypt.compare(req.body.password, user.password);
    console.log(passCompare);
    if (!passCompare) {
      throw new Error("incorrect credentials!");
    }
    const data = {
      user: {
        userName: req.body.userName,
      },
    };
    const auth_token = jwt.sign(data, JWT_SECRET);
    await User.findOneAndUpdate(
      { userName: req.body.userName },
      { isActive: true }
    );
    res.status(200).send({ status: "success", auth_token: auth_token });
  } catch (e) {
    console.log(e.message);
    res.status(400).send({ status: "failed", msg: e.message });
  }
});

router.get("/getUsers", async (req, res) => {
  // console.log(req);
  try {
    const getUserResult = await User.find();
    if (!getUserResult) {
      throw new Error("Internal Server Error!");
    }
    res.send({ status: "success", getUserResult });
  } catch (e) {
    console.log(e.message);
    res.status(500).send({ status: "failed", msg: e.message });
  }
});

router.get("/getUsers/:searchString", async (req, res) => {
  // console.log(req);
  try {
    const searchString = req.params.searchString;
    const getUserResult = await User.find({
      $or: [
        { userName: { $regex: searchString, $options: "i" } },
        { name: { $regex: searchString, $options: "i" } },
      ],
    }); //filter the self username in frontend
    if (!getUserResult) {
      throw new Error("Internal Server Error!");
    }
    res.status(200).send({ status: "success", getUserResult });
  } catch (e) {
    console.log(e.message);
    res.status(500).send({ status: "failed", msg: e.message });
  }
});

router.patch("/logOutUser/:userName", async (req, res) => {
  // console.log(req);
  try {
    const userName = req.params.userName;
    const getUserResult = await User.find({
      userName: userName,
    }); //filter the self username in frontend
    if (!getUserResult) {
      throw new Error("Internal Server Error!");
    }
    await User.findOneAndUpdate({ userName: userName }, { isActive: false });
    res.status(200).send({ status: "success" });
  } catch (e) {
    console.log(e.message);
    res.status(500).send({ status: "failed", msg: e.message });
  }
});

module.exports = router;
