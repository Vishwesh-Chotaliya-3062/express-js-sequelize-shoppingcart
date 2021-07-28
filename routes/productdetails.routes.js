module.exports = (app) => {
    const productDetails = require("../controllers/productdetails.controller");
  
    var router = require("express").Router();

    router.get("/productdetails/:productid", productDetails.getProductDetails);
  
    app.use("/", router);
  };
  