module.exports = (app) => {
    const userProfile = require("../Controllers/userprofile.controller");
  
    var router = require("express").Router();
  
    router.get("/userprofile", userProfile.getUserProfile);
  
    // router.post("/userprofile", userProfile.postUserProfile);
  
    app.use("/", router);
};
  