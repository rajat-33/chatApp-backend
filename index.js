const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const port = 8000;
const connectToMongo = require("./db");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");
  // Handle socket events here
  socket.on("chatup", (msg) => {
    console.log(msg.msg);
    io.emit(msg.userName, msg.msg);
  });
});

app.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.send("hello world");
});

server.listen(8000, () => {
  console.log("Socket.IO server running on port 8000");
});

// connectToMongo();
// io.on("connection", (socket) => {
//   console.log("a user connected");
// });
// app.use(express.json());
// app.get("/", (req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.send("hello world");
// });
// app.use("/auth", require("./routes/auth"));
// app.use("/request", require("./routes/request"));

// app.listen(port, () => {
//   console.log("Server running at http://localhost:8000");
// });
