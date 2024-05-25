const express = require("express");
const router = express.Router();
const Request = require("../model/Request");
const User = require("../model/User");

router.post("/makeRequest", async (req, res) => {
  try {
    const userSender = await User.findOne({ userName: req.body.sender });
    const userReceiver = await User.findOne({ userName: req.body.receiver });
    if (!userSender || !userReceiver) {
      throw new Error("Connection can't be established!");
    }
    const isReqExist1 = await Request.findOne({
      sender: req.body.sender,
      receiver: req.body.receiver,
    });
    const isReqExist2 = await Request.findOne({
      receiver: req.body.sender,
      sender: req.body.receiver,
    });
    if (isReqExist1 || isReqExist2) {
      throw new Error("A request has been sent already!");
    }
    const newRequest = await Request.create(req.body);
    await newRequest.save();
    res.status(200).send({ status: "success", id: newRequest._id });
  } catch (e) {
    res.status(500).send({ status: "failed", message: e.message });
  }
});

// for debugging
router.get("/getRequest", async (req, res) => {
  try {
    const requestResults = await Request.find();

    res.status(200).send({ status: "success", requestResults });
  } catch (e) {
    res.status(500).send({ status: "failed", message: e.message });
  }
});

router.get("/getRequest/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const userSender = await User.findOne({ userName: id });
    if (!userSender) {
      throw new Error("Internal Server Error!");
    }
    const requestResults = await Request.find({
      receiver: id,
      isAnswered: false,
    });

    res.status(200).send({ status: "success", requestResults });
  } catch (e) {
    res.status(500).send({ status: "failed", message: e.message });
  }
});

router.delete("/deleteRequest/:id1/:id2", async (req, res) => {
  try {
    const sender = req.params.id1;
    const receiver = req.params.id2;
    const userSender = await User.findOne({ userName: sender });
    const userReceiver = await User.findOne({ userName: receiver });
    if (!userSender || !userReceiver) {
      throw new Error("Request cannot be deleted!");
    }
    const deleteResult = await Request.deleteOne(
      {
        sender: sender,
        receiver: receiver,
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

router.patch("/acceptRequest/:id1/:id2", async (req, res) => {
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
      { connections: [...userSender.connections, receiver] }
    );
    const updateResult2 = await User.findOneAndUpdate(
      { userName: receiver },
      { connections: [...userReceiver.connections, sender] }
    );

    console.log(updateResult1);
    console.log(updateResult2);

    const deleteResult = await Request.findOneAndUpdate(
      {
        sender: sender,
        receiver: receiver,
      },
      { isAnswered: true }
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
