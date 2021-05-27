var express = require("express");
var app = express();
const {sequelize} = require("../models/db");
const {User} = require("../models/user.model");
const {Product} = require("../models/product.model");
const {Wallet} = require("../models/wallet.model");
const {Cart} = require("../models/cart.model");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");

var cookieParser = require("cookie-parser");
app.use(cookieParser());

exports.getCart = async (req, res, next) => {
  try {
    const token = req.cookies.token;

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
            res.cookie("username", UserName);
            console.log("user", UserName);

            const userDetails = await User.findAll({
              attributes: ["UserID", "UserName", "Status"],
              include: Wallet,
              where: {
                UserName: UserName,
              },
            });
            for (user in userDetails) {
              let userid = userDetails[user].UserID;
              let link = `/verify/${userid}`;

              const countProducts = await Cart.count({
                where : {
                  UserID : userid
                }
              });

              const productQuantity = await Cart.findAll({
                include : {
                  model : Product,
                },
                where : {
                  UserID : userid
                }
              });

              // for(product1 in productQuantity){
              //   console.log(productQuantity[product1].product.ProductName);
              // }

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

              const walletBalance = Math.ceil(userDetails[user].wallet.Balance);

              res.render("cart", {
                userDetails: userDetails,
                countProducts: countProducts,
                walletBalance: walletBalance,
                productQuantity : productQuantity,
                cartCount : cartCount,
                link: link,
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
