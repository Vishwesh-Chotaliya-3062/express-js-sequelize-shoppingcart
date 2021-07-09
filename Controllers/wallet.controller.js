var express = require("express");
var app = express();
const { sequelize } = require("../models/db");
const { User } = require("../models/user.model");
const { Wallet } = require("../models/wallet.model");
const { Cart } = require("../models/cart.model");
const { Couponcode } = require("../models/couponcode.model");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");

var cookieParser = require("cookie-parser");
const { ProfileImage } = require("../models/profileImage.model");
app.use(cookieParser());

exports.getWallet = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const userid = req.cookies.userid;

    const aq = await User.findOne({
      where: {
        UserID: userid
      }
    });

    if(aq.UserName === "admin")
    {
      await res.render("notauthorizederror");
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
            console.log("user", UserName);

            const ab = await ProfileImage.findOne({
              where: {
                UserID: userid,
              }
            });

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

            for (user in userDetails) {
              let userid = userDetails[user].UserID;
              let link = `/verify/${userid}`;
              // for(product1 in productQuantity){
              //   console.log(productQuantity[product1].product.ProductName);
              // }

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

              await res.render("wallet", {
                userDetails: userDetails,
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

exports.addWallet = async (req, res, next) => {
  const Amount = req.body.Amount;
  const UserID = req.cookies.userid;

    const aq = await User.findOne({
      where: {
        UserID: userid
      }
    });

    if(aq.UserName === "admin")
    {
      await res.render("notauthorizederror");
    }
    
  console.log("Amount:", Amount);

  try {
    await sequelize.query("CALL addWallet( :UserID, :Amount)", {
      replacements: { Amount, UserID },
      logging: false,
    });
    return res.redirect("/wallet");
  } catch (e) {
    console.log(e);
    return res.send(500).send("Something went wrong!");
  }
};
