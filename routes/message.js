const express = require("express");
const router = express.Router();
const Message = require("../model/Message");
const User = require("../model/User");

router.post("/sendMessageConnection", async (req, res) => {
  try {
    const userSender = await User.findOne({ userName: req.body.sender });
    const userReceiver = await User.findOne({ userName: req.body.receiver });
    if (!userSender || !userReceiver) {
      throw new Error("Connection can't be established!");
    }
    const newMessageConnection = await Message.create(req.body);
    await newMessageConnection.save();
    res.status(200).send({ status: "success", id: newMessageConnection._id });
  } catch (e) {
    res.status(500).send({ status: "failed", message: e.message });
  }
});

router.patch("/sendMessage/:id1/:id2", async (req, res) => {
  try {
    const senderId = req.params.id1;
    const receiverId = req.params.id2;
    const userSender = await User.findOne({ userName: senderId });
    const userReceiver = await User.findOne({ userName: receiverId });
    if (!userSender || !userReceiver) {
      throw new Error("User not found!");
    }
    const MessageConnection = await Message.find({
      sender: senderId,
      receiver: receiverId,
    });
    if (!MessageConnection) {
      throw new Error("Not Found!");
    }
    const requestResults = await Message.findOneAndUpdate(
      { sender: senderId, receiver: receiverId },
      {
        messages: [
          ...MessageConnection.messages,
          { message: req.body.message, timestamp: Date.now },
        ],
      }
    );
    res.status(200).send({ status: "success", requestResults });
  } catch (e) {
    res.status(404).send({ status: "failed", message: e.message });
  }
});

module.exports = router;
