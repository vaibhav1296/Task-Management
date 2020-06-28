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
app.use(methodOverride("_method"));
app.use(
  require("express-session")({
    secret: "Mahi bhai is love",
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  res.send("home page");
});

app.use("/task", indexRoutes);
app.use("/task", taskRoutes);

app.listen(3000, () => {
  console.log(`The server is running on port 3000`);
});
