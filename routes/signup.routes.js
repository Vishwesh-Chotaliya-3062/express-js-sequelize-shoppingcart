module.exports = (app) => {
  const user = require("../controllers/signup.controller.js");
  const { check } = require("express-validator");
  var router = require("express").Router();

  router.get("/signup", user.getUser);

  // Create a new User
  router.post(
    "/signup",
    [
      check("UserName", "This User Name must be 3+ characters long")
        .exists()
        .isLength({ min: 3 }),
      check("UserName", "User Name is empty").not().isEmpty(),
      check("Email", "Email is empty").not().isEmpty(),
      check("Email", "Email is not valid").exists().isEmail().normalizeEmail(),
      check("Password", "Password is empty")
        .not()
        .isEmpty()
    ],
    user.create 
  );

  app.use("/", router);
};
