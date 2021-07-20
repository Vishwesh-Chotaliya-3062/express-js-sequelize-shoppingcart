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
const { Op } = require("sequelize");
var cookieParser = require("cookie-parser");
const { ProfileImage } = require("../models/profileImage.model");
app.use(cookieParser());

exports.userAuthorization = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const Add = req.cookies.Add;

    if (req.cookies.Refresh) {
      await res.clearCookie("Refresh");
    }

    if (!token) {
      await res.redirect("/login");
    } else {
      try {
        console.log("Authentication Token:", token);

        jwt.verify(token, "thisismysecret", async (err, data) => {
          if (err) {
            await res.redirect("/login");
          } else {
            var decoded = jwt_decode(token);
            var UserName = decoded.UserName;
            await res.cookie("username", UserName);
            const u = await User.findOne({
              where: {
                UserName: UserName,
              },
            });
            await res.cookie("userid", u.UserID);

            if (UserName === "admin") {
              await res.redirect("/manageusers");
            }

            const ab = await ProfileImage.findOne({
              where: {
                UserID: u.UserID,
              },
            });

            const userDetails = await User.findAll({
              attributes: ["UserID", "UserName", "Status"],
              include: Wallet,
              where: {
                UserName: UserName,
              },
            });

            var countProducts = await Product.count();

            var perPage = 6;

            var pages = Math.ceil(countProducts / perPage);

            var pageNumber = req.query.page == null ? 1 : req.query.page;

            var startFrom = (pageNumber - 1) * perPage;

            var last = pageNumber - 1;

            var next = last + 2;

            if (pageNumber > pages) {
              await res.redirect(`/welcome?page=${pages}`);
            } 

            var filters = req.query;
            delete filters.page;
            var productDetails;

            var all = await Product.findAll();

            var allUniqueCompanyName = await Product.findAll({
              attributes: [
                [sequelize.fn('DISTINCT', sequelize.col('CompanyName')) ,'CompanyName']
            ]
            });

            var allUniqueCategory = await Product.findAll({
              attributes: [
                [sequelize.fn('DISTINCT', sequelize.col('Category')) ,'Category']
            ]
            });

            var allUniqueSubCategory = await Product.findAll({
              attributes: [
                [sequelize.fn('DISTINCT', sequelize.col('SubCategory')) ,'SubCategory']
            ]
            });

            var ProductName  = req.body.ProductName;
            if(ProductName == null || ProductName == '')
            {
              productDetails = await Product.findAll({
                limit: perPage,
                offset: startFrom
              });
              console.log("NO")
            }
            else{
              productDetails = await Product.findAll({
                where: {
                  ProductName : {
                    [Op.like]: '%' + ProductName + '%'
                }
                }
              });
              console.log("YES")
            }

            console.log(productDetails)

            const filteredUsers = all.filter(user => {
              let isValid = true;
              for (key in filters) {
                console.log(key, user[key], filters[key]);
                isValid = isValid && user[key] == filters[key];
              }
              return isValid;
            });

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
                ab: ab,
                pages,
                last,
                next,
                pageNumber,
                filteredUsers: filteredUsers,
                allUniqueCategory,
                allUniqueCompanyName,
                allUniqueSubCategory
              });
            }
          }
        });
      } catch (err) {
        await res.json({
          error: "Error occured while Aunthenticattion: ",
        });
      }
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
