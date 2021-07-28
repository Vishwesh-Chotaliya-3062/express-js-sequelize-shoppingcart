module.exports = (app) => {
  const useraddress = require("../controllers/useraddress.controller");

  var router = require("express").Router();

  router.post("/address/:userid", useraddress.getUserAddress);

  router.get("/address/:userid", useraddress.getUserAddress);

  app.use("/", router);
};
