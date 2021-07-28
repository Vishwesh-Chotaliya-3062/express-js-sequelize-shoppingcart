module.exports = (app) => {
  const manageProducts = require("../controllers/manageproducts.controller");
  const editProduct = require("../controllers/editproduct.controller");

  var router = require("express").Router();

  router.get("/manageproducts", manageProducts.getManageProducts);

  router.get("/manageproducts/delete/:productid", manageProducts.deleteProduct);

  router.get(
    "/manageproducts/restore/:productid",
    manageProducts.restoreProduct
  );

  router.get("/manageproducts/edit/:productid", editProduct.getEditProduct);

  router.post("/manageproducts/edit/:productid", editProduct.postEditProduct);

  app.use("/", router);
};
