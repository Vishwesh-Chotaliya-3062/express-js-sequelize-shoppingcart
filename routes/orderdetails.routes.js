module.exports = (app) => {
  const orderdetails = require("../Controllers/orderdetails.controller");

  var router = require("express").Router();

  router.get("/orderdetails", orderdetails.getCart);

  router.post("/orderdetails", orderdetails.getCart);

  router.post("/couponcode/apply/:userid", orderdetails.checkCouponCode);

  router.post("/couponcode/remove/:userid", orderdetails.removeCouponCode);

  router.get("/:orderId/payment", orderdetails.getPayment);

  router.get("/:orderId/status", orderdetails.getStatus);

  app.use("/", router);
};
