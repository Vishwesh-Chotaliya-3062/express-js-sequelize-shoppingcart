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
app.use(cookieParser());

exports.getCart = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const userid = req.cookies.userid;
    let cookieflag = 0;
    res.cookie("flag", cookieflag);

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
      await res.redirect("/login");
    } else {
      try {
        jwt.verify(token, "thisismysecret", async (err, data) => {
          if (err) {
            await res.redirect("/login");
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

            const countCouponcode = await Couponcode.count({
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

              const cartTotalPrice = await Cart.findOne({
                attributes: [
                  [sequelize.fn("SUM", sequelize.col("Total")), "Total"],
                ],
                where: {
                  UserID: userid,
                },
              });

              const cartCount = cartTotalQuantity.Quantity;

              const walletBalance = Math.ceil(userDetails[user].wallet.Balance);

              await res.render("cart", {
                userDetails: userDetails,
                countProducts: countProducts,
                walletBalance: walletBalance,
                productQuantity: productQuantity,
                cartCount: cartCount,
                link: link,
                countCouponcode: countCouponcode,
                cartTotalPrice: cartTotalPrice,
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

exports.addToCart = async (req, res, next) => {
  const ProductID = req.params.productid;
  const UserID = req.cookies.userid;

  const aq = await User.findOne({
    where: {
      UserID: UserID,
    },
  });

  if (aq.UserName === "admin") {
    await res.render("notauthorizederror");
  }

  try {
    const productQuantity = await Product.findOne({
      where: {
        ProductID: ProductID,
      },
    });

    const cartProductQuantity = await Cart.findOne({
      model: Product,
      where: {
        ProductID: ProductID,
        UserID: UserID,
      },
    });

    if (productQuantity.QuantityLeft <= 0) {
      return res.redirect("/welcome");
    } else {
      if (cartProductQuantity) {
        if (cartProductQuantity.Quantity >= productQuantity.QuantityLeft) {
          return res.redirect("/welcome");
        } else {
          await sequelize.query("CALL AddToCart( :UserID, :ProductID)", {
            replacements: { UserID, ProductID },
            logging: false,
          });
          return res.redirect("/welcome");
        }
      } else {
        await sequelize.query("CALL AddToCart( :UserID, :ProductID)", {
          replacements: { UserID, ProductID },
          logging: false,
        });
        return res.redirect("/welcome");
      }
    }
  } catch (e) {
    return res.status(500).send("Something went wrong!");
  }
};

exports.updateCart = async (req, res, next) => {
  const ProductID = req.params.productid;
  const UserID = req.cookies.userid;

  const aq = await User.findOne({
    where: {
      UserID: UserID,
    },
  });

  if (aq.UserName === "admin") {
    await res.render("notauthorizederror");
  }

  const Quantity = req.body.Quantity;
  console.log(Quantity)

  try {
    await sequelize.query("CALL UpdateCart( :UserID, :ProductID, :Quantity)", {
      replacements: { UserID, ProductID, Quantity },
      logging: false,
    });
    return res.redirect("/cart");
  } catch (e) {
    return res.status(500).send("Something went wrong!");
  }
};

exports.deleteCart = async (req, res, next) => {
  const ProductID = req.params.productid;
  const UserID = req.cookies.userid;

  const aq = await User.findOne({
    where: {
      UserID: UserID,
    },
  });

  if (aq.UserName === "admin") {
    await res.render("notauthorizederror");
  }

  try {
    await sequelize.query("CALL DeleteCart( :UserID, :ProductID)", {
      replacements: { UserID, ProductID },
      logging: false,
    });
    return res.redirect("/cart");
  } catch (e) {
    return res.status(500).send("Something went wrong!");
  }
};
