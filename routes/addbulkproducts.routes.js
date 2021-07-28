module.exports = (app) => {
    const addBulkProducts = require("../controllers/addbulkproducts.controller");
    var router = require("express").Router();
  
    router.get("/addbulkproducts", addBulkProducts.getAddBulkProductsByCSV);
  
    router.post("/addbulkproducts", addBulkProducts.postAddBulkProductsByCSV);
  
    app.use("/", router);
  };
  