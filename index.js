require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
// const cron = require("node-cron");
const schedule = require("node-schedule");
const methodOverride = require("method-override");
const sgMail = require("@sendgrid/mail");
const app = express();
const indexRoutes = require("./routes/index");
const taskRoutes = require("./routes/task-routes");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(
  require("express-session")({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use((req, res, next)=>{
  res.locals.currentUser = req.session.isLoggedIn;
  res.locals.userName = req.session.userName;
  next();
});
app.get("/", (req, res) => {
  res.render("landing");
});

app.use("/task", indexRoutes);
app.use("/task", taskRoutes);

app.listen(3000, () => {
  console.log(`The server is running on port 3000`);
});
