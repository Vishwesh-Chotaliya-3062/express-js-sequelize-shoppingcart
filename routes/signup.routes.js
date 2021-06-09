module.exports = (app) => {
  const user = require("../controllers/signup.controller.js");
  var router = require("express").Router();
  const { check } = require("express-validator");

  router.get("/signup", user.getUser);

  // Create a new User
  router.post(
    "/signup",
    [
      check("UserName", "User Name must be 3+ characters long")
        .exists()
        .isLength({ min: 4 }),
      check("Email", "Email is not valid").exists().isEmail(),
    ],
    user.create
  );

  app.use("/", router);
};
