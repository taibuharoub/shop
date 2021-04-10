exports.getLogin = (req, res, next) => {
  // console.log(req.get("Cookie"));
  // console.log(req.get("Cookie").trim().split("=")[1]);
  // console.log(req.get("Cookie").split(";")[1].trim().split("=")[1]);
  // const isLoggedIn = req.get("Cookie").trim().split("=")[1] === "true";
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  res.setHeader("Set-Cookie", "loggedIn=true; HttpOnly");
  res.redirect("/")
};
