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

connectToMongo();
//socket here

io.on("connection", (socket) => {
  // Handle socket events here
  socket.on("chatup", (msg) => {
    console.log(msg);
    io.emit(msg.receiver, msg);
  });
});

//app here
app.use(express.json());
app.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
});
app.use("/auth", require("./routes/auth"));
app.use("/request", require("./routes/request"));

server.listen(port, () => {
  console.log("Server running at http://localhost:8000");
});
