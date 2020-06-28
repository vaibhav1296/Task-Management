const express = require("express");
const router = express.Router();
const queryObject = require("../DAO/queryDAO");
const bcrypt = require("bcrypt");
const models = require("../models/index");
const middlewareObject = require("../middleware/authentication");
// const utility = require("../utility/utility");

// router.get("/secret", middlewareObject.isLogIn, (req, res) => {
//   console.log(req.session.user);
//   res.send("this is the secret page");
// });

router.get("/register", (req, res) => {
  res.render("../views/registration-form");
});

router.post("/register", (req, res) => {
  queryObject.findUserWithEmail(req.body.email).then((user) => {
    console.log("user", user);
    if (!user) {
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
                    res.send("User registered successfully check DB");
                  } else {
                    res.send("something went wrong with registration");
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            }
          });
        }
      });
    } else {
      console.log("user nhi hai");
    }
  });

  //   console.log("typeof name", typeof user.DOB);
  //   res.send("Everything is just fine till now");
});

router.get("/login", (req, res) => {
  res.render("../views/login-form");
});
router.post("/login", (req, res) => {
  queryObject
    .findUserWithEmail(req.body.email)
    .then((user) => {
      if (!user) {
        res.send("Please sign in first");
        res.redirect("/task/register");
      } else {
        bcrypt.compare(
          req.body.password,
          user.hashedPassword,
          (err, result) => {
            if (!result) {
              res.send("somthing went wrong with password");
            } else {
              req.session.isLoggedIn = true;
              req.session.user = user;
              res.send("You are logged in successfully");
            }
          }
        );
      }
    })
    .catch((err) => {
      console.log(err);
      res.send("Somthing went wrong with this route");
    });
});

router.get("/logout", (req, res) => {
  req.session.isLoggedIn = false;
  res.send("You are logged out");
});

module.exports = router;
