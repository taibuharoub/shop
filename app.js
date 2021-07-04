const path = require("path");
const fs = require("fs");
const https = require("https")

const dotenv = require("dotenv");
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
require('dotenv').config()

const errorController = require("./controllers/error");
const User = require("./models/user");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const webhookRoute = require("./routes/webhook");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a"}
);

const MONGODB_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.rnpgx.mongodb.net/${process.env.MONGO_DATABASE}`;
const app = express();
port = process.env.PORT || 3000;
const store = new MongoDBStore({
  uri: MONGODB_URL,
  collection: "sessions",
});

const csrfProtection = csrf();

//read in the certf files
//readFileSync will block execution
// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.urlencoded({extended: true}));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "Lazy Dog",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
//after u intalise ur session then add the csrf middleware
app.use(csrfProtection);
//Do after u intalised the session
app.use(flash());

//after we etract the use but before all our routes
app.use((req, res, next) => {
  //allows us to set local variables that are passed to our views
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

/* app.use((req, res, next) => {
  User.findById("6071fbcf3aa1f024508ce3e3")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
}); */
app.use((req, res, next) => {
  //only works in sync code
  //inside async code use next and wrap the error
  // throw new Error("Sync Dummy");
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(webhookRoute);

app.get("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...)
  // res.redirect("/500");
  // console.log(error);
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(MONGODB_URL, { useUnifiedTopology: true, useNewUrlParser: true })
  .then((request) => {
    app.listen(port, () => {
      console.log(`Server Started at http://localhost:${port}`);
    });
    /* https.createServer({key: privateKey, cert: certificate}, app).listen(port, () => {
      console.log(`Server Started at http://localhost:${port}`);
    }); */
  })
  .catch((err) => {
    console.log(err);
  });
