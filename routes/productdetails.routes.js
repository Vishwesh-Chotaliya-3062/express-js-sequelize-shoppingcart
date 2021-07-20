module.exports = (app) => {
    const productDetails = require("../Controllers/productdetails.controller");
  
    var router = require("express").Router();

    router.get("/productdetails/:productid", productDetails.getProductDetails);
  
    app.use("/", router);
  };
  