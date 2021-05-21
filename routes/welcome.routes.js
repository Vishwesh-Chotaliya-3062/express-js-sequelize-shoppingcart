module.exports = (app) => {
  const outofstock = require("../Controllers/welcome.controller");

  var router = require("express").Router();
  
  router.get("/welcome", outofstock.userAuthorization);

  app.use("/", router);
};