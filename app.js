//jshint version:6

//require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// mongoose.connect("mongodb://localhost:27017/abcd", {
//   useUnifiedTopology: true,
//   useNewUrlParser: true,
// });

// mongoose.set("useCreateIndex", true);

// const loginschema = new mongoose.Schema({});

// const User = new mongoose.model("User", loginschema);

app.get("/", function (req, res) {
  res.render("login");
});

app.get("/done", function (req, res) {
  res.render("done");
});

app.get("/template", function (req, res) {
  res.render("template");
});

app.post("/template", function (req, res) {
  ans = req.body.answer;
  console.log(ans);
  res.render("done", { answer1: ans });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("server running on port 3000");
});
