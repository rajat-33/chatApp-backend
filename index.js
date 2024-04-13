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

app.listen(port, () => {
  console.log("Server running at http://localhost:8000");
});
