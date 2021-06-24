var express = require("express");
var app = express();
const { sequelize } = require("../models/db");
const { User } = require("../models/user.model");
const { Wallet } = require("../models/wallet.model");
const { Cart } = require("../models/cart.model");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const { sendPasswordChanged } = require("../helper/mailer.helper");

var cookieParser = require("cookie-parser");
const { Couponcode } = require("../models/couponcode.model");
app.use(cookieParser());

exports.getChangePassword = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const userid = req.cookies.userid;

    if (!token) {
      res.redirect("login");
      // res.json({
      //   error: "Unauthorized",
      // });
    } else {
      try {
        console.log("Authentication Token:", token);

        jwt.verify(token, "thisismysecret", async (err, data) => {
          if (err) {
            res.redirect("login");
          } else {
            console.log("Verified");
            var decoded = jwt_decode(token);
            console.log(decoded);
            var UserName = decoded.UserName;
            await res.cookie("username", UserName);
            console.log("user", UserName);

            const userDetails = await User.findAll({
              attributes: ["UserID", "UserName", "Status"],
              include: Wallet,
              where: {
                UserName: UserName,
              },
            });

            const countCouponcode = await Couponcode.count({
              where: {
                UserID: userid,
              },
            });

            const couponcodeDetails = await Couponcode.findAll({
              where: {
                UserID: userid,
              },
            });

            for (user in userDetails) {
              let userid = userDetails[user].UserID;

              const countProducts = await Cart.count({
                where: {
                  UserID: userid,
                },
              });

              const cartTotalQuantity = await Cart.findOne({
                attributes: [
                  [sequelize.fn("SUM", sequelize.col("Quantity")), "Quantity"],
                ],
                where: {
                  UserID: userid,
                },
              });

              const cartCount = cartTotalQuantity.Quantity;

              const walletBalance = Math.ceil(userDetails[user].wallet.Balance);

              await res.render("changepassword", {
                userDetails: userDetails,
                countProducts: countProducts,
                walletBalance: walletBalance,
                cartCount: cartCount,
                userid: userid,
                countCouponcode: countCouponcode,
                couponcodeDetails: couponcodeDetails,
              });
            }
          }
        });
      } catch (err) {
        console.log("Error occured while Aunthenticattion: ", err.message);
        res.json({
          error: "Error occured while Aunthenticattion: ",
        });
      }
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

exports.postChangePassword = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const userid = req.cookies.userid;
    const { Old_Pass, New_Pass, Confirm_Pass } = req.body;
    console.log(req.body);

    if (!token) {
      res.redirect("login");
      // res.json({
      //   error: "Unauthorized",
      // });
    } else {
      try {
        console.log("Authentication Token:", token);

        jwt.verify(token, "thisismysecret", async (err, data) => {
          if (err) {
            res.redirect("login");
          } else {
            console.log("Verified");
            var decoded = jwt_decode(token);
            console.log(decoded);
            var UserName = decoded.UserName;
            await res.cookie("username", UserName);
            console.log("user", UserName);

            const getUser = async (obj) => {
              return await User.findOne({
                where: obj,
              });
            };

            if (Old_Pass && New_Pass && Confirm_Pass) {
              let user = await getUser({ UserID: userid });

              bcrypt.compare(
                req.body.Old_Pass,
                user.Password,
                async function (err, isMatch) {
                  if (err) {
                    throw err;
                  } else if (!isMatch) {
                    const checkPass =
                      "You have entered incorrect old password.";

                    const userDetails = await User.findAll({
                      attributes: ["UserID", "UserName", "Status"],
                      include: Wallet,
                      where: {
                        UserName: UserName,
                      },
                    });

                    const countCouponcode = await Couponcode.count({
                      where: {
                        UserID: userid,
                      },
                    });

                    const couponcodeDetails = await Couponcode.findAll({
                      where: {
                        UserID: userid,
                      },
                    });

                    for (user in userDetails) {
                      let userid = userDetails[user].UserID;

                      const countProducts = await Cart.count({
                        where: {
                          UserID: userid,
                        },
                      });

                      const cartTotalQuantity = await Cart.findOne({
                        attributes: [
                          [
                            sequelize.fn("SUM", sequelize.col("Quantity")),
                            "Quantity",
                          ],
                        ],
                        where: {
                          UserID: userid,
                        },
                      });

                      const cartCount = cartTotalQuantity.Quantity;

                      const walletBalance = Math.ceil(
                        userDetails[user].wallet.Balance
                      );

                      await res.render("changepassword", {
                        userDetails: userDetails,
                        countProducts: countProducts,
                        walletBalance: walletBalance,
                        cartCount: cartCount,
                        userid: userid,
                        countCouponcode: countCouponcode,
                        couponcodeDetails: couponcodeDetails,
                        checkPass: checkPass
                      });
                    }
                  } else {
                    // await res.redirect("changepassword");
                    // res.json({
                    //   msg: "Your password matched",
                    // });
                    if(Confirm_Pass !== New_Pass)
                    {
                    const checkConfirmPass =
                        "Both password does not match";

                    const userDetails = await User.findAll({
                      attributes: ["UserID", "UserName", "Status"],
                      include: Wallet,
                      where: {
                        UserName: UserName,
                      },
                    });

                    const countCouponcode = await Couponcode.count({
                      where: {
                        UserID: userid,
                      },
                    });

                    const couponcodeDetails = await Couponcode.findAll({
                      where: {
                        UserID: userid,
                      },
                    });

                    for (user in userDetails) {
                      let userid = userDetails[user].UserID;

                      const countProducts = await Cart.count({
                        where: {
                          UserID: userid,
                        },
                      });

                      const cartTotalQuantity = await Cart.findOne({
                        attributes: [
                          [
                            sequelize.fn("SUM", sequelize.col("Quantity")),
                            "Quantity",
                          ],
                        ],
                        where: {
                          UserID: userid,
                        },
                      });

                      const cartCount = cartTotalQuantity.Quantity;

                      const walletBalance = Math.ceil(
                        userDetails[user].wallet.Balance
                      );

                      await res.render("changepassword", {
                        userDetails: userDetails,
                        countProducts: countProducts,
                        walletBalance: walletBalance,
                        cartCount: cartCount,
                        userid: userid,
                        countCouponcode: countCouponcode,
                        couponcodeDetails: couponcodeDetails,
                        checkConfirmPass: checkConfirmPass
                      });
                    }
                    }
                    else if(Confirm_Pass === New_Pass){
                        bcrypt.genSalt(saltRounds, async function (err, salt) {
                            if (err) {
                              throw err;
                            } else {
                              bcrypt.hash(
                                req.body.New_Pass,
                                salt,
                                async function (err, hash) {
                                  if (err) {
                                    throw err;
                                  } else {
                                    const newpass = hash;
                                    User.update({
                                        Password: newpass
                                    },
                                    {
                                        where: {
                                            UserID: userid
                                        }
                                    })
                                    .then(async () => {
                                        
                                        const u1 = await User.findOne({
                                            where: {
                                              UserID: userid,
                                            },
                                        });

                                        sendPasswordChanged(
                                          { UserName: u1.UserName, Email: u1.Email }
                                        ),

                                        await res.redirect("/logout");
                                      })
                                    .catch(async (err) => {
                                        console.log(err);
                                        res.json({
                                          error: err.message,
                                        });
                                      });
                                  }
                                }
                              );
                            }
                          });
                    }
                    else{
                        res.render("/error");
                    }
                  }
                }
              );
            } else {
              checkEmpty = "Enter Username and Password.";
              await res.render("login", { checkEmpty });
            }
          }
        });
      } catch (err) {
        console.log("Error occured while Aunthenticattion: ", err.message);
        res.json({
          error: "Error occured while Aunthenticattion: ",
        });
      }
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
