module.exports = (app) => {
  const history = require("../controllers/history.controller");

  var router = require("express").Router();

  router.get("/history", history.getHistory);

  router.get("/history/delete/:orderId", history.deleteOrder);

  app.use("/", router);
};
