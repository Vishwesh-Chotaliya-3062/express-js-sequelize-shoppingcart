module.exports = (app) => {
  const userAuth = require("../controllers/login.controller");

  var router = require("express").Router();

  router.get("/login", userAuth.getAuthentication);

  router.post("/login", userAuth.userAuthentication);

  router.get("/logout", userAuth.getLogout);

  app.use("/", router);
};
