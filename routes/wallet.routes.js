module.exports = (app) => {
  const wallet = require("../Controllers/wallet.controller");

  var router = require("express").Router();

  router.get("/wallet", wallet.getWallet);

  router.post("/wallet", wallet.addWallet);

  app.use("/", router);
};
