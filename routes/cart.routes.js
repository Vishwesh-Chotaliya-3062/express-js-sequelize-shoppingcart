module.exports = (app) => {
  const cart = require("../Controllers/cart.controller");

  var router = require("express").Router();

  router.get("/cart", cart.getCart);

  app.use("/", router);
};
