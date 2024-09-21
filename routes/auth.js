const express = require("express");
const router = express.Router();
const User = require("../model/User");
const Request = require("../model/Request");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

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
      session_end_time: Date.now(),
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
    res.status(200).send({
      status: "success",
      auth_token: auth_token,
      session_end_time: Date.now(),
    });
  } catch (e) {
    console.log(e.message);
    res.status(400).send({ status: "failed", msg: e.message });
  }
});

//this is getUser api for authenticating the logged in user and fetch
router.get("/getUser/:userName", async (req, res) => {
  try {
    //authenticating the auth_token
    const userName = req.params.userName;
    const token = req.header("auth-token");
    if (!token) {
      throw Error("Please authenticate using a valid token");
    }
    const data = jwt.verify(token, JWT_SECRET);

    //fetching the user
    const getUserResult = await User.findOne({ userName: userName });
    if (!getUserResult) {
      throw new Error("Internal Server Error!");
    }
    res.send({ status: "success", getUserResult });
  } catch (e) {
    console.log(e.message);
    res.status(500).send({ status: "failed", msg: e.message });
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

router.patch("/deleteFriend/:id1/:id2", async (req, res) => {
  try {
    const sender = req.params.id1;
    const receiver = req.params.id2;
    const userSender = await User.findOne({ userName: sender });
    const userReceiver = await User.findOne({ userName: receiver });
    if (!userSender || !userReceiver) {
      throw new Error("Request cannot be accepted!");
    }
    const updateResult1 = await User.findOneAndUpdate(
      { userName: sender },
      {
        connections: userSender.connections.filter((e) => {
          return e != receiver;
        }),
      }
    );
    const updateResult2 = await User.findOneAndUpdate(
      { userName: receiver },
      {
        connections: userReceiver.connections.filter((e) => {
          return e != sender;
        }),
      }
    );
    const deleteResult1 = await Request.deleteOne(
      {
        sender: sender,
        receiver: receiver,
      },
      { new: true }
    );
    const deleteResult2 = await Request.deleteOne(
      {
        sender: receiver,
        receiver: sender,
      },
      { new: true }
    );
    if (deleteResult1.deletedCount === 0 && deleteResult2.deletedCount === 0) {
      throw new Error("Friend cannot be removed!");
    }
    res.status(200).send({ status: "success" });
  } catch (e) {
    res.status(404).send({ status: "failed", message: e.message });
  }
});

module.exports = router;
