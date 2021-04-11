const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  // console.log(req.get("Cookie"));
  // console.log(req.get("Cookie").trim().split("=")[1]);
  // console.log(req.get("Cookie").split(";")[1].trim().split("=")[1]);
  // const isLoggedIn = req.get("Cookie").trim().split("=")[1] === "true";
  console.log(req.session);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: true,
  });
};

// exports.postLogin = (req, res, next) => {
//   // res.setHeader("Set-Cookie", "loggedIn=true; HttpOnly");
//   req.session.isLogged = true;
//   res.redirect("/")
// };
exports.postLogin = (req, res, next) => {
  User.findById("6071fbcf3aa1f024508ce3e3")
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      res.redirect("/");
    })
    .catch((err) => console.log(err));
  
};
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });  
};
