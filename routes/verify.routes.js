module.exports = (app) => {
  const verifyAuth = require("../Controllers/verify.controller");

  var router = require("express").Router();

  router.get("/verify/:UserID", verifyAuth.getVerify);

  router.post("/verify", verifyAuth.postVerify);

  app.use("/", router);
};
