const express = require("express");
const app = express();
const port = 8000;
const connectToMongo = require("./db");
connectToMongo();
app.get("/", (req, res) => {
  res.send("hello world");
});
app.use(express.json());
app.use("/auth", require("./routes/auth"));
app.use("/request", require("./routes/request"));

app.listen(port, () => {
  console.log("Server running at http://localhost:8000");
});
