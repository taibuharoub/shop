const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session)

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

app.use((req, res, next) => {
  User.findById("6071fbcf3aa1f024508ce3e3")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URL, { useUnifiedTopology: true })
  .then((request) => {
    User.findOne().then(user => {
      if(!user) {
        const user = new User({
          name: "Taibu",
          email: "ty@gmail.com",
          cart: {
            items: []
          }
        })
        user.save();
      }
    })
    app.listen(port, () => {
      console.log(`Server Started at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
