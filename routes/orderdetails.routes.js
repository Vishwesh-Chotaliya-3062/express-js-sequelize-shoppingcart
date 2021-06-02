module.exports = (app) => {
  const orderdetails = require("../Controllers/orderdetails.controller");

  var router = require("express").Router();

  router.post("/orderdetails", orderdetails.getCart);

  app.use("/", router);
};