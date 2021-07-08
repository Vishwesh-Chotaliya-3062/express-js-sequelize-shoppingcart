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

            const ab = await ProfileImage.findOne({
              where: {
                UserID: userid,
              }
            });

            const allUserDetails = await User.findAll({
                where: {
                  UserName: {
                    [Op.not]: 'admin'
                  }
                },
                paranoid: false
            });
            
            console.log(allUserDetails);

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
                ab: ab
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

exports.deleteUser = async (req, res, next) => {
    const userid = req.params.userid;
  
    try {
      await User.destroy({
        where: {
          UserID: userid
        }
      });

      await res.redirect("/manageusers");
    } catch (e) {
      console.log(e);
      return res.send(500).send("Something went wrong!");
    }
};

exports.restoreUser = async (req, res, next) => {
  const userid = req.params.userid;

  try {
    await User.restore({
      where: {
        UserID: userid
      }
    });

    await res.redirect("/manageusers");
  } catch (e) {
    console.log(e);
    return res.send(500).send("Something went wrong!");
  }
};