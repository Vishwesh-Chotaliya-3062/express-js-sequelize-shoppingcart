module.exports = (app) => {
  const cart = require("../controllers/cart.controller");

  var router = require("express").Router();

  router.get("/cart", cart.getCart);

  router.post("/cart/added/:productid", cart.addToCart);

  router.post("/cart/updated/:productid", cart.updateCart);

  router.post("/cart/deleted/:productid", cart.deleteCart);

  app.use("/", router);
};