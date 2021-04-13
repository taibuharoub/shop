const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session)
const csrf = require("csurf");
const flash = require("connect-flash");

const errorController = require("./controllers/error");
const User = require("./models/user");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth")

const MONGODB_URL = "mongodb://localhost:27017/local-shop";
const app = express();
port = 3000;
const store = new MongoDBStore({
  uri: MONGODB_URL,
  collection: "sessions"
});

const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: "Lazy Dog",
  resave: false,
  saveUninitialized: false,
  store: store
}))
//after u intalise ur session then add the csrf middleware
app.use(csrfProtection);
//Do after u intalised the session
app.use(flash());

/* app.use((req, res, next) => {
  User.findById("6071fbcf3aa1f024508ce3e3")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
}); */
app.use((req, res, next) => {
  if(!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

//after we etract the use but before all our routes
app.use((req, res, next) => {
  //allows us to set local variables that are passed to our views
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URL, { useUnifiedTopology: true })
  .then((request) => {
    app.listen(port, () => {
      console.log(`Server Started at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
