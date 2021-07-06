module.exports = (app) => {
    const addProduct = require("../Controllers/addproduct.controller");
    var router = require("express").Router();
  
    router.get("/addproduct", addProduct.getAddProduct);
  
    router.post(
      "/addproduct",
      addProduct.postAddProduct
    );
  
    app.use("/", router);
  };