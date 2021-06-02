var express = require("express");
var app = express();
const { sequelize } = require("../models/db");
const { User } = require("../models/user.model");
const { Product } = require("../models/product.model");
const { Wallet } = require("../models/wallet.model");
const { Cart } = require("../models/cart.model");
const { Salesorder } = require("../models/salesorder.model");
const { Couponcode } = require("../models/couponcode.model");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");

var cookieParser = require("cookie-parser");
app.use(cookieParser());

exports.getCart = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const cookieuserid = req.cookies.userid;

    cookieflag = req.cookies.flag;
    console.log("Flag", cookieflag);

    if (!token) {
      // res.json({
      //   error: "Unauthorized",
      // });
      res.redirect("login");
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
              attributes: ["UserID", "UserName", "Email", "Status"],
              include: Wallet,
              where: {
                UserName: UserName,
              },
            });

            const countCouponcode = await Couponcode.count({
              where: {
                UserID : cookieuserid,
              },
            });

            const couponcodeDetails = await Couponcode.findAll({
              where: {
                UserID: cookieuserid
              }
            });

            const cartSubTotalPrice = await Cart.findOne({
              attributes: [
                [sequelize.fn("SUM", sequelize.col("Total")), "Total"],
              ],
              where: {
                UserID: cookieuserid,
              },
            });

            if(cookieflag == 1)
            {
              for (user in userDetails) {

                let userid = userDetails[user].UserID;
  
                const countProducts = await Cart.count({
                  where: {
                    UserID: userid,
                  },
                });
  
                const productQuantity = await Cart.findAll({
                  include: {
                    model: Product,
                  },
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
  
                const discountPrice = cartSubTotalPrice.Total/2;

                const cartTotalPrice = cartSubTotalPrice.Total - discountPrice;
  
                const cartCount = cartTotalQuantity.Quantity;
  
                const walletBalance = Math.ceil(userDetails[user].wallet.Balance);
  
                await res.render("orderdetails", {
                  userDetails: userDetails,
                  countProducts: countProducts,
                  walletBalance: walletBalance,
                  productQuantity: productQuantity,
                  cartCount: cartCount,
                  countCouponcode: countCouponcode,
                  cartSubTotalPrice: cartSubTotalPrice,
                  cookieuserid: cookieuserid,
                  discountPrice: discountPrice,
                  cookieflag: cookieflag,
                  couponcodeDetails: couponcodeDetails,
                  cartTotalPrice: cartTotalPrice
                });
              }
            }
            else {

              for (user in userDetails) {

                let userid = userDetails[user].UserID;
  
                const countProducts = await Cart.count({
                  where: {
                    UserID: userid,
                  },
                });
  
                const productQuantity = await Cart.findAll({
                  include: {
                    model: Product,
                  },
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
  
                const discountPrice = 0;
                
                const cartTotalPrice = cartSubTotalPrice.Total - discountPrice;
  
                const cartCount = cartTotalQuantity.Quantity;
  
                const walletBalance = Math.ceil(userDetails[user].wallet.Balance);
  
                await res.render("orderdetails", {
                  userDetails: userDetails,
                  countProducts: countProducts,
                  walletBalance: walletBalance,
                  productQuantity: productQuantity,
                  cartCount: cartCount,
                  countCouponcode: countCouponcode,
                  cartSubTotalPrice: cartSubTotalPrice,
                  cookieuserid: cookieuserid,
                  discountPrice: discountPrice,
                  cookieflag: cookieflag,
                  couponcodeDetails: couponcodeDetails,
                  cartTotalPrice: cartTotalPrice
                });
              }

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

exports.checkCouponCode = async (req, res, next) => {

  const UserID = req.params.userid;
  const CouponCode = req.body.CouponCode;

  console.log("Userid:", UserID);

  console.log("Coupon Code:", CouponCode);

  try {
    const userCouponCode = await Couponcode.findOne({
      where : {
        UserID : UserID
      }
    });

    console.log("user coupon", userCouponCode.CouponCode);
    let flag = 0;

    if(CouponCode !== userCouponCode.CouponCode)
    {
      flag = 0;
      res.cookie("flag", flag);
      return res.redirect("/orderdetails");
    }

    else{
      flag = 1;
      console.log("True", flag);
      res.cookie("flag", flag);
      return res.redirect("/orderdetails");
    }

  } catch (e) {
    console.log(e);
    return res.send(500).send("Something went wrong!");
  }
};

exports.removeCouponCode = async (req, res, next) => {

  try {
    let flag = 0;
    res.clearCookie("flag");
    res.cookie("flag", flag);
    return res.redirect("/orderdetails");

  } catch (e) {
    console.log(e);
    return res.send(500).send("Something went wrong!");
  }
};
