module.exports = (app) => {
  const manageProducts = require("../Controllers/manageproducts.controller");
  const editProduct = require("../Controllers/editproduct.controller");

  var router = require("express").Router();

  router.get("/manageproducts", manageProducts.getManageProducts);

  router.get("/manageproducts/delete/:productid", manageProducts.deleteProduct);

  router.get(
    "/manageproducts/restore/:productid",
    manageProducts.restoreProduct
  );

  router.get("/manageproducts/edit/:productid", editProduct.getEditProduct);

  app.use("/", router);
};
