const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;
const bcrypt = require("bcryptjs");
const { use } = require("passport");

exports.getAuthentication = async (req, res, next) => {
  try {

    res.render("login");
  } catch (error) {
    return res.status(500).json(500, false, error.message);
  }
};

const getUser = async (obj) => {
  return await User.findOne({
    where: obj,
  });
};

exports.userAuthentication = async function (req, res, next) {

  const { UserName, Password } = req.body;
  console.log(UserName)
  if (UserName && Password) {
    let user = await getUser({ UserName: UserName });
    if (!user) {
      res.status(401).json({ message: "No such user found" });
    }

    bcrypt.compare(req.body.Password, user.Password, async function (err, isMatch) {
      if (err) {
        throw err;
      } else if (!isMatch) {
        res.json({ msg: "Password doest not match" });
      } else {
        let payload = { id: user.UserID, name: user.UserName };
        let token = jwt.sign(payload, "thisismysecret", {expiresIn:10000});
        res.cookie("token", token);
        console.log("Generated Token:", token);
        console.log(user.Status);
        
        // res.json({
        //   msg: "Hello there, This is your Authentication Token",
        //   token: token,
        // });
      }

      await res.redirect("welcome");

    });
  } 
  else {
    res.status(401).json({ message: "Enter UserName and Password" });
  }
};