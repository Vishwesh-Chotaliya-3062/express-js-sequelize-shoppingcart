const jwt = require("jsonwebtoken");
const {sequelize} = require("../models/db");
const {User} = require("../models/user.model");
const bcrypt = require("bcryptjs");

exports.getAuthentication = async (req, res, next) => {
  try {
    res.render("login");
  } catch (error) {
    return res.status(500).json(500, false, error.message);
  }
};

exports.userAuthentication = async function (req, res, next) {
  const getUser = async (obj) => {
      return await User.findOne({
      where: obj,
    });
  };

  const { UserName, Password } = req.body;
  console.log(UserName);
  if (UserName && Password) {
    let user = await getUser({ UserName: UserName });
    if (!user) {
      res.status(401).json({ message: "No such user found" });
    }

    bcrypt.compare(
      req.body.Password,
      user.Password,
      async function (err, isMatch) {
        if (err) {
          throw err;
        } else if (!isMatch) {
          await res.render("login");
        } else {
          let payload = { UserID: user.UserID, UserName: user.UserName };
          let token = jwt.sign(payload, "thisismysecret", { expiresIn: 10000 });
          user.Token = token;
          await user.save();
          res.cookie("token", token);
          console.log("Generated Token:", token);
          console.log(user.Status);
          await res.redirect("welcome");
          // res.json({
          //   msg: "Hello there, This is your Authentication Token",
          //   token: token,
          // });
        }
      }
    );
  } else {
    res.status(401).json({ message: "Enter UserName and Password" });
  }
};

exports.getLogout = async function (req, res, next) {
  
  res.clearCookie("userid");
  res.clearCookie("username");
  res.clearCookie("token");
  res.clearCookie("flag");

  res.redirect("login");
};
