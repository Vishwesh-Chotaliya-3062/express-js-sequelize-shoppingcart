var express = require("express");
var app = express();
const { sequelize } = require("../models/db");
const { User } = require("../models/user.model");
const { Product } = require("../models/product.model");
const { Wallet } = require("../models/wallet.model");
const { Cart } = require("../models/cart.model");
const { Couponcode } = require("../models/couponcode.model");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const { ProfileImage } = require("../models/profileImage.model");
const { ProductImage } = require("../models/productImage.model");
app.use(cookieParser());

exports.userAuthorization = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const Add = req.cookies.Add;

    if (req.cookies.Refresh) {
      console.log(req.cookies.Refresh);
      res.clearCookie("Refresh");
    }

    if (!token) {
      res.redirect("login");
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
            const u = await User.findOne({
              where: {
                UserName: UserName,
              },
            });
            await res.cookie("userid", u.UserID);
            console.log("user", UserName);

            if(UserName === "admin")
            {
              await res.redirect("/manageusers");
            }

            const ab = await ProfileImage.findOne({
              where: {
                UserID: u.UserID,
              }
            });
            
            const userDetails = await User.findAll({
              attributes: ["UserID", "UserName", "Status"],
              include: Wallet,
              where: {
                UserName: UserName,
              },
            });

            const countProducts = await Product.count();

            const productDetails = await Product.findAll();

            const countCouponcode = await Couponcode.count({
              where: {
                UserID: u.UserID,
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

              await res.render("welcome", {
                userDetails: userDetails,
                countProducts: countProducts,
                productDetails: productDetails,
                walletBalance: walletBalance,
                cartCount: cartCount,
                link: link,
                userid: userid,
                countCouponcode: countCouponcode,
                Add: Add,
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
