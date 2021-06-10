const jwt = require("jsonwebtoken");
const { sequelize } = require("../models/db");
const { User } = require("../models/user.model");
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
  
  var checkPass = "";
  var checkEmpty = "";
  var checkUser = "";
  const { UserName, Password } = req.body;
  console.log(UserName);
  if (UserName && Password) {
    let user = await getUser({ UserName: UserName });
    if (!user) {
      checkUser = "No such user found.";
      await res.render("login", { checkUser });
    }

    bcrypt.compare(
      req.body.Password,
      user.Password,
      async function (err, isMatch) {
        if (err) {
          throw err;
        } else if (!isMatch) {
          checkPass = "You have entered incorrect password.";
          await res.render("login", { checkPass });
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
    checkEmpty = "Enter Username and Password.";
    await res.render("login", { checkEmpty });
  }
};

exports.getLogout = async function (req, res, next) {
  res.clearCookie("userid");
  res.clearCookie("username");
  res.clearCookie("token");
  res.clearCookie("flag");

  res.redirect("login");
};
