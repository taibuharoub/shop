const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const User = require("./models/user");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const app = express();
port = 3000;

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("6054bdd3f56b462c644952f5")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect("mongodb://localhost:27017/local-shop", { useUnifiedTopology: true })
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
