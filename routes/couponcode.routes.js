module.exports = (app) => {
  const couponcode = require("../controllers/couponcode.controller");

  var router = require("express").Router();

  router.get("/couponcode", couponcode.getCouponcode);

  app.use("/", router);
};
