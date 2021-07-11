const { sequelize } = require("../models/db");
const { User } = require("../models/user.model");
const { Wallet } = require("../models/wallet.model");
const { Secretcode } = require("../models/secretcode.model");
const { validationResult } = require("express-validator");

const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
var otpGenerator = require("crypto-random-string");
const { sendVerifyEmail } = require("../helper/mailer.helper");

let secretcode = otpGenerator(6, {
  upperCase: true,
  specialChars: false,
});

exports.getUser = async (req, res, next) => {
  try {
    await res.render("signup");
  } catch (error) {
    return res.status(500).json(500, false, error.message);
  }
};

// Create and Save a new User
exports.create = async (req, res) => {
  var errors = validationResult(req);
  var emailCheck = "";
  var checkUserEmpty = "";
  var checkEmailEmpty = "";
  var checkPassEmpty = "";
  const { UserName, Email, Password } = req.body;
  if (!UserName) {
    checkUserEmpty = "Username is Empty.";
    res.render("signup", {
      checkUserEmpty,
    });
  }
  if (!Email) {
    checkEmailEmpty = "Email is Empty.";
    res.render("signup", {
      checkEmailEmpty,
    });
  }
  if (!Password) {
    checkPassEmpty = "Password is Empty.";
    res.render("signup", {
      checkPassEmpty,
    });
  }
  var alert = errors.array();
  if (!errors.isEmpty()) {
    res.render("signup", {
      alert,
    });
  } else {
    const user = {
      UserName: req.body.UserName,
      Email: req.body.Email,
      Password: req.body.Password,
      Status: req.body.Status,
      wallet: {},
    };

    await User.findOne({
      where: {
        UserName: user.UserName,
      },
    })
      .then(async (data) => {
        if (!data) {
          await User.findOne({
            where: {
              Email: user.Email,
            },
          })
            .then(async (data) => {
              if (!data) {
                bcrypt.genSalt(saltRounds, async function (err, salt) {
                  if (err) {
                    throw err;
                  } else {
                    bcrypt.hash(
                      req.body.Password,
                      salt,
                      async function (err, hash) {
                        if (err) {
                          throw err;
                        } else {
                          user.Password = hash;
                          await User.create(user, {
                            include: { model: Wallet },
                          })
                            .then(async (data) => {

                              await Secretcode.create({
                                Email: req.body.Email,
                                Code: secretcode,
                              });

                              sendVerifyEmail(
                                { UserName: data.UserName, Email: data.Email },
                                secretcode
                              ),
                                await res.redirect("verify/" + data.UserID);
                            })
                            .catch(async (err) => {
                              res.json({
                                error: err.message,
                              });
                            });
                        }
                      }
                    );
                  }
                });
              } else {
                emailCheck = "Email already exists";
                res.render("signup", { emailCheck });
              }
            })
            .catch((err) => {
              res.json({
                error: err.message,
              });
            });
        } else {
          emailCheck = "Username already exists";
          res.render("signup", { emailCheck });
        }
      })
      .catch((err) => {
        res.json({
          error: err.message,
        });
      });
  }
};
