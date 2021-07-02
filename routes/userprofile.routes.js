module.exports = (app) => {
  const userProfile = require("../Controllers/userprofile.controller");
  const { check } = require("express-validator");
  var router = require("express").Router();

  router.get("/userprofile", userProfile.getUserProfile);

  router.post(
    "/userprofile",
    [
      check("UserProfileName", "User Name must be 3+ characters long")
        .exists()
        .isLength({ min: 4 }),
      check("UserProfileEmail", "Email is not valid").exists().isEmail(),
    ],
    userProfile.getUserAddressProfile
  );

  app.use("/", router);
};
