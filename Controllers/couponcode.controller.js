var express = require("express");
var app = express();
const { sequelize } = require("../models/db");
const { User } = require("../models/user.model");
const { Product } = require("../models/product.model");
const { Wallet } = require("../models/wallet.model");
const { Cart } = require("../models/cart.model");
const { Salesorder } = require("../models/salesorder.model");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");

var cookieParser = require("cookie-parser");
const { Couponcode } = require("../models/couponcode.model");
app.use(cookieParser());

exports.getCouponcode = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const userid = req.cookies.userid;

    if (!token) {
      res.json({
        error: "Unauthorized",
      });
    } else {
      try {
        console.log("Authentication Token:", token);

        jwt.verify(token, "thisismysecret", async (err, data) => {
          if (err) {
            res.json({
              error: "Unauthorized",
            });
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

            const user1 = await User.findOne({
              where: {
                UserID : userid,
              }
            })

            console.log(user1.Email);

            const countCouponcode = await Couponcode.count({
              where: {
                Email : user1.Email,
              },
            });
            
            const couponcodeDetails = await Couponcode.findAll({
              where: {
                Email: user1.Email
              }
            });

            for (user in userDetails) {
              let userid = userDetails[user].UserID;
              let link = `/verify/${userid}`;

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

              await res.render("couponcode", {
                userDetails: userDetails,
                countProducts: countProducts,
                walletBalance: walletBalance,
                cartCount: cartCount,
                link: link,
                countCouponcode: countCouponcode,
                couponcodeDetails: couponcodeDetails
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