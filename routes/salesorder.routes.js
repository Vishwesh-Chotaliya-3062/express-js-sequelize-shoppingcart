module.exports = (app) => {
    const salesorder = require("../Controllers/salesorder.controller");
  
    var router = require("express").Router();
    
    router.get("/outofstock", salesorder.getOutofstock);

    router.get('/success', salesorder.getSuccess);
  
    app.use("/", router);
};
  