var express = require("express");
var app = express();
const { sequelize } = require("../models/db");
const { User } = require("../models/user.model");
const { Wallet } = require("../models/wallet.model");
const { Cart } = require("../models/cart.model");
const { Couponcode } = require("../models/couponcode.model");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");
const path = require("path");
const readCsvFile = require("../helper/readCSVFile.helper");
var cookieParser = require("cookie-parser");
const { ProfileImage } = require("../models/profileImage.model");
const fs = require("fs");
const csv = require("csv-parser");
const { Product } = require("../models/product.model");
const { ProductImage } = require("../models/productImage.model");
app.use(cookieParser());

exports.getAddBulkProductsByCSV = async (req, res, next) => {
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
      await res.redirect("login");
    } else {
      try {
        jwt.verify(token, "thisismysecret", async (err, data) => {
          if (err) {
            await res.redirect("login");
          } else {
            var decoded = jwt_decode(token);
            var UserName = decoded.UserName;
            await res.cookie("username", UserName);

            const ab = await ProfileImage.findOne({
              where: {
                UserID: userid,
              },
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

              await res.render("addbulkproducts", {
                userDetails: userDetails,
                walletBalance: walletBalance,
                cartCount: cartCount,
                countCouponcode: countCouponcode,
                link: link,
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

exports.postAddBulkProductsByCSV = async (req, res, next) => {
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
      res.redirect("/login");
    } else {
      try {
        jwt.verify(token, "thisismysecret", async (err, data) => {
          if (err) {
            res.redirect("/login");
          } else {
            var decoded = jwt_decode(token);
            var UserName = decoded.UserName;
            await res.cookie("username", UserName);

            try {
              const file = req.files.ProductsCSV;

              if (!file) {
                const msg = "No file attached";
                const ab = await ProfileImage.findOne({
                  where: {
                    UserID: userid,
                  },
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

                  await res.render("addbulkproducts", {
                    userDetails: userDetails,
                    walletBalance: walletBalance,
                    cartCount: cartCount,
                    countCouponcode: countCouponcode,
                    link: link,
                    ab: ab,
                    msg,
                  });
                }
              }

              await file.mv("views/images/" + file.name, async function (err) {
                if (err) await res.json(err.message);

                const products = fs
                  .createReadStream("views/images/" + file.name)
                  .pipe(csv())
                  .on("data", async (row) => {
                    console.log(row);

                    const c1 = await Product.create(row);
                  })
                  .on("end", async () => {
                    console.log("CSV file successfully processed");
                  });

                console.log("--------Added");

                await res.redirect("/addbulkproducts");
              });
            } catch (error) {
              return res.json(error.message);
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
