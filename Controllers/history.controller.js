var express = require("express");
var app = express();
const { sequelize } = require("../models/db");
const { User } = require("../models/user.model");
const { Wallet } = require("../models/wallet.model");
const { Cart } = require("../models/cart.model");
const { Product } = require("../models/product.model");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");

var cookieParser = require("cookie-parser");
const { Couponcode } = require("../models/couponcode.model");
const { Order, OrderDetail } = require("../models/order.model");
const { ProfileImage } = require("../models/profileImage.model");

app.use(cookieParser());

exports.getHistory = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const userid = req.cookies.userid;

    const aq = await User.findOne({
      where: {
        UserID: userid,
      },
    });

    if (aq.UserName === "admin") {
      await res.render("notauthorizederror");
    }

    if (req.cookies.Refresh) {
      await res.clearCookie("Refresh");
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

            const userDetails = await User.findAll({
              attributes: ["UserID", "UserName", "Status"],
              include: Wallet,
              where: {
                UserName: UserName,
              },
            });

            const ab = await ProfileImage.findOne({
              where: {
                UserID: userid,
              },
            });

            const getOrder = await Order.count({
              where: {
                userUserID: userid,
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

              const OrderData = await Order.findAll({
                where: {
                  userUserID: userid,
                },
                include: {
                  model: OrderDetail,
                  include: {
                    model: Product,
                  },
                },
              });

              await res.render("history", {
                userDetails: userDetails,
                countProducts: countProducts,
                walletBalance: walletBalance,
                cartCount: cartCount,
                link: link,
                countCouponcode: countCouponcode,
                couponcodeDetails: couponcodeDetails,
                getOrder: getOrder,
                OrderData: OrderData,
                ab: ab,
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

exports.deleteOrder = async (req, res, next) => {
  const userid = req.cookies.userid;

  const aq = await User.findOne({
    where: {
      UserID: userid,
    },
  });

  if (aq.UserName === "admin") {
    await res.render("notauthorizederror");
  }

  const orderId = req.params.orderId;

  try {
    await sequelize.query("CALL DeleteOrder( :orderId)", {
      replacements: { orderId },
    });
    return res.redirect("/history");
  } catch (e) {
    return res.send(500).send("Something went wrong!");
  }
};
