module.exports = (app) => {
  const user = require("../controllers/signup.controller.js");

  var router = require("express").Router();

  router.get("/signup", user.getUser);

  // Create a new User
  router.post("/signup", user.create);

  app.use("/", router);
};
