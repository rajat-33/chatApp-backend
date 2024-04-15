const express = require("express");
const router = express.Router();
const Request = require("../model/Request");
const User = require("../model/User");

router.post("/makeRequest", async (req, res) => {
  try {
    // if (req.body.sender == req.body.receiver) {
    //   throw new Error("Can't send a self connection request");
    // }
    const userSender = await User.findOne({ userName: req.body.sender });
    const userReceiver = await User.findOne({ userName: req.body.receiver });
    if (!userSender || !userReceiver) {
      throw new Error("Connection can't be established!");
    }
    const newRequest = await Request.create(req.body);
    await newRequest.save();
    res.status(200).send({ status: "success", id: newRequest._id });
  } catch (e) {
    res.status(500).send({ status: "failed", message: e.message });
  }
});

router.get("/getRequest", async (req, res) => {
  try {
    const userSender = await User.findOne({ userName: req.body.userName });
    if (!userSender) {
      throw new Error("Internal Server Error!");
    }
    const requestResults = await Request.find({ receiver: req.body.userName });

    res.status(200).send({ status: "success", requestResults });
  } catch (e) {
    res.status(500).send({ status: "failed", message: e.message });
  }
});

router.delete("/deleteRequest", async (req, res) => {
  try {
    const userSender = await User.findOne({ userName: req.body.sender });
    const userReceiver = await User.findOne({ userName: req.body.receiver });
    if (!userSender || !userReceiver) {
      throw new Error("Request cannot be deleted!");
    }
    const deleteResult = await Request.deleteOne(
      {
        sender: req.body.sender,
        receiver: req.body.receiver,
      },
      { new: true }
    );
    if (deleteResult.deletedCount === 0) {
      throw new Error("Request cannot be deleted!");
    }
    console.log(deleteResult);
    res.status(200).send({ status: "success" });
  } catch (e) {
    res.status(404).send({ status: "failed", message: e.message });
  }
});

router.patch("/acceptRequest", async (req, res) => {
  try {
    const userSender = await User.findOne({ userName: req.body.sender });
    const userReceiver = await User.findOne({ userName: req.body.receiver });
    if (!userSender || !userReceiver) {
      throw new Error("Request cannot be accepted!");
    }
    const updateResult1 = await User.findOneAndUpdate(
      { userName: req.body.sender },
      { connections: [...userSender.connections, req.body.receiver] }
    );
    const updateResult2 = await User.findOneAndUpdate(
      { userName: req.body.receiver },
      { connections: [...userReceiver.connections, req.body.sender] }
    );

    console.log(updateResult1);
    console.log(updateResult2);

    const deleteResult = await Request.deleteOne(
      {
        sender: req.body.sender,
        receiver: req.body.receiver,
      },
      { new: true }
    );
    if (deleteResult.deletedCount === 0) {
      throw new Error("Request cannot be deleted!");
    }
    console.log(deleteResult);
    res.status(200).send({ status: "success" });
  } catch (e) {
    res.status(404).send({ status: "failed", message: e.message });
  }
});

module.exports = router;
