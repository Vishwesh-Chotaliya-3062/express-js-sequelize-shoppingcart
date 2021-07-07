module.exports = (app) => {
    const manageUsers = require("../Controllers/manageusers.controller");
    var router = require("express").Router();
  
    router.get("/manageusers", manageUsers.getManageUsers);
  
    router.get("/manageusers/delete/:userid", manageUsers.deleteUser);
  
    app.use("/", router);
  };