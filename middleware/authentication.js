let middlewareObject = {};
middlewareObject.isLogIn = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    console.log("You are not authorized");
    res.redirect("/task/login");
  }
  next();
};

module.exports = middlewareObject;
