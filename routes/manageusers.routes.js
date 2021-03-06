module.exports = (app) => {
  const manageUsers = require("../controllers/manageusers.controller");
  var router = require("express").Router();

  router.get("/manageusers", manageUsers.getManageUsers);

  router.get("/manageusers/delete/:userid", manageUsers.deleteUser);

  router.get("/manageusers/restore/:userid", manageUsers.restoreUser);

  app.use("/", router);
};
