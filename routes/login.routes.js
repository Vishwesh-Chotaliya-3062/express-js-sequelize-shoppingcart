module.exports = (app) => {
  const userAuth = require("../Controllers/login.controller");

  var router = require("express").Router();

  router.get("/login", userAuth.getAuthentication);

  router.post("/login", userAuth.userAuthentication);

  app.use("/", router);
};
