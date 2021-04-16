const express = require("express");
// const expValidator = require("express-validator/check"); //import a sub package
const { check } = require("express-validator"); //import a sub package

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post("/login", authController.postLogin);

router.post(
  "/signup",
  check("email").isEmail().withMessage("Please enter a valid email.").custom((value, {req}) => {
      if (value === "pp@pp.com") {
          throw new Error("This email address is forbidden");
      }
      return true;
  }),
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
