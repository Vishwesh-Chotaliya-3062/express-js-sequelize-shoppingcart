module.exports = (app) => {
  const changePassword = require("../controllers/changepassword.controller");

  var router = require("express").Router();

  router.get("/changepassword", changePassword.getChangePassword);

  router.post("/changepassword", changePassword.postChangePassword);

  app.use("/", router);
};
