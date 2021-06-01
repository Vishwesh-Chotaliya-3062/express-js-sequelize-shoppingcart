module.exports = (app) => {
  const couponcode = require("../Controllers/couponcode.controller");

  var router = require("express").Router();

  router.get("/couponcode", couponcode.getCouponcode);

  app.use("/", router);
};