module.exports = (app) => {
    const manageProducts = require("../Controllers/manageproducts.controller");
    var router = require("express").Router();
  
    router.get("/manageproducts", manageProducts.getManageProducts);
  
    router.get("/manageproducts/delete/:productid", manageProducts.deleteProduct);

    router.get("/manageproducts/restore/:productid", manageProducts.restoreProduct);
  
    app.use("/", router);
};