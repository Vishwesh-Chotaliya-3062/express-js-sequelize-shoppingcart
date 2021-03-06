module.exports = (app) => {
  const addProduct = require("../controllers/addproduct.controller");
  var router = require("express").Router();

  router.get("/addproduct", addProduct.getAddProduct);

  router.post("/addproduct", addProduct.postAddProduct);

  app.use("/", router);
};
