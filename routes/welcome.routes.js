module.exports = (app) => {
  const outofstock = require("../controllers/welcome.controller");

  var router = require("express").Router();

  router.get("/welcome", outofstock.userAuthorization);

  router.post("/welcome", outofstock.userAuthorization);

  app.use("/", router);
};
