var express = require("express");
var app = express();
const { sequelize } = require("../models/db");
const { User } = require("../models/user.model");
const { Wallet } = require("../models/wallet.model");
const { Cart } = require("../models/cart.model");
const { Couponcode } = require("../models/couponcode.model");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

var cookieParser = require("cookie-parser");
const { ProfileImage } = require("../models/profileImage.model");
app.use(cookieParser());

exports.getManageUsers = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const userid = req.cookies.userid;

    const aq = await User.findOne({
      where: {
        UserID: userid,
      },
    });

    if (aq.UserName !== "admin") {
      await res.render("notauthorizederror");
    }

    if (!token) {
      res.redirect("login");
    } else {
      try {
        jwt.verify(token, "thisismysecret", async (err, data) => {
          if (err) {
            res.redirect("login");
          } else {
            var decoded = jwt_decode(token);
            var UserName = decoded.UserName;
            await res.cookie("username", UserName);

            const getUser = await User.count({
              where: {
                UserName: {
                  [Op.not]: "admin",
                },
              },
              paranoid: false,
            });

            const ab = await ProfileImage.findOne({
              where: {
                UserID: userid,
              },
            });

            const allUserDetails = await User.findAll({
              where: {
                UserName: {
                  [Op.not]: "admin",
                },
              },
              paranoid: false,
            });

            const userDetails = await User.findAll({
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

            for (user in userDetails) {
              let userid = userDetails[user].UserID;
              let link = `/verify/${userid}`;

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

              await res.render("manageusers", {
                userDetails: userDetails,
                allUserDetails: allUserDetails,
                walletBalance: walletBalance,
                cartCount: cartCount,
                countCouponcode: countCouponcode,
                link: link,
                ab: ab,
                getUser: getUser,
              });
            }
          }
        });
      } catch (err) {
        res.json({
          error: "Error occured while Aunthenticattion: ",
        });
      }
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

exports.deleteUser = async (req, res, next) => {
  const userid = req.params.userid;
  const UserID = req.cookies.userid;

  const aq = await User.findOne({
    where: {
      UserID: UserID,
    },
  });

  if (aq.UserName !== "admin") {
    await res.render("notauthorizederror");
  }

  try {
    await User.destroy({
      where: {
        UserID: userid,
      },
    });

    await res.redirect("/manageusers");
  } catch (e) {
    return res.send(500).send("Something went wrong!");
  }
};

exports.restoreUser = async (req, res, next) => {
  const userid = req.params.userid;
  const UserID = req.cookies.userid;

  const aq = await User.findOne({
    where: {
      UserID: UserID,
    },
  });

  if (aq.UserName !== "admin") {
    await res.render("notauthorizederror");
  }

  try {
    await User.restore({
      where: {
        UserID: userid,
      },
    });

    await res.redirect("/manageusers");
  } catch (e) {
    return res.send(500).send("Something went wrong!");
  }
};
