// const express = require("express");
const express = require('./express手写实现/index');
const app = express();


app.get("/", function (req, res, next) {
  console.log("4");
  res.end("ok!");
});


app.get("/add", (req, res) => {
  res.end("add");
});

app.listen(3000, () => {
  console.log("server start on port 3000!!!");
});
