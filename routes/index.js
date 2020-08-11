const express = require("express");
const router = express.Router();
const app = express();
const queryObject = require("../DAO/queryDAO");
const bcrypt = require("bcrypt");
const models = require("../models/index");
const middlewareObject = require("../middleware/authentication");
var flashMessage = {
  message: "",
  state: false,
};
// const utility = require("../utility/utility");

// router.get("/secret", middlewareObject.isLogIn, (req, res) => {
//   console.log(req.session.user);
//   res.send("this is the secret page");
// });

router.get("/register", (req, res) => {
  if (req.session.flashState === true) {
    req.session.flashState = false;
    res.render("../views/registration-form", { flashMessage: flashMessage });
  } else {
    flashMessage.state = false;
    res.render("../views/registration-form", { flashMessage: flashMessage });
  }
});

router.post("/register", (req, res) => {
  queryObject.findUserWithEmail(req.body.email).then((user) => {
    if (!user) {
      if (req.body.password.length >= 5) {
        bcrypt.genSalt(6, (err, salt) => {
          if (err) {
            console.log("something wrong with bcrypt");
            res.redirect("/task/register");
          } else {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
              if (err) {
                console.log("somthing went wrong with hash");
              } else {
                req.body.password = hash;
                const user = {
                  name: req.body.name,
                  email: req.body.email,
                  hashedPassword: req.body.password,
                  gender: req.body.gender,
                  dob: req.body.dob,
                  profession: req.body.profession,
                };
                return queryObject
                  .createANewUser(user)
                  .then((user) => {
                    if (user) {
                      flashMessage.message = "User Registered successfully";
                      flashMessage.state = true;
                      req.session.flashState = true;
                      res.redirect("/task/login");
                    } else {
                      flashMessage.message =
                        "Something went wrong with registration";
                      flashMessage.state = true;
                      req.session.flashState = true;
                      console.log("something went wrong with pata nahi ");
                      res.redirect("/task/register");
                    }
                  })
                  .catch((err) => {
                    flashMessage.message =
                      "Something went wrong with registration";
                    flashMessage.state = true;
                    req.session.flashState = true;
                    res.redirect("/task/register");
                  });
              }
            });
          }
        });
      } else {
        flashMessage.message = "Password must be of atleast 5 characters";
        flashMessage.state = true;
        req.session.flashState = true;
        res.redirect("/task/register");
      }
    } else {
      flashMessage.message = "User already exists";
      flashMessage.state = true;
      req.session.flashState = true;
      res.redirect("/task/register");
    }
  });

  //   console.log("typeof name", typeof user.DOB);
  //   res.send("Everything is just fine till now");
});

router.get("/login", (req, res) => {
  if (req.session.flashState === true) {
    req.session.flashState = false;
    res.render("../views/login-form", { flashMessage: flashMessage });
  } else {
    flashMessage.state = false;
    res.render("../views/login-form", { flashMessage: flashMessage });
  }
});
router.post("/login", (req, res) => {
  queryObject
    .findUserWithEmail(req.body.email)
    .then((user) => {
      if (!user) {
        req.session.flashState = true;
        flashMessage.message = "User does not exists";
        flashMessage.state = true;
        res.redirect("/task/register");
      } else {
        bcrypt.compare(
          req.body.password,
          user.hashedPassword,
          (err, result) => {
            if (!result) {
              req.session.flashState = true;
              flashMessage.message = "somthing went wrong with password";
              flashMessage.state = true;
              res.redirect("/task/login");
            } else {
              req.session.isLoggedIn = true;
              req.session.user = user;
              req.session.userName = user.dataValues.name;
              console.log("user logged in");
              res.redirect("/task/all");
            }
          }
        );
      }
    })
    .catch((err) => {
      console.log(err);
      flashMessage.message = "Somthing went wrong with this route";
      flashMessage.state = true;
      flashMessage.flashState = true;
      res.redirect("/task/login");
    });
});

router.get("/logout", (req, res) => {
  req.session.isLoggedIn = false;
  app.locals.currentUser = false;
  res.redirect("/");
});

module.exports = router;
