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

            var filters = req.query;
            var productDetails;
            
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
            var ss = 0;

            if(ProductName == null || ProductName == '')
            {
              if(filters.Brand && filters.Category) {
                var av = filters.Brand;
                var va = filters.Category;

                var countProducts = await Product.count({
                  where: {
                    CompanyName: av,
                    Category: va
                  }
                });

                var perPage = 6;

                var pages = Math.ceil(countProducts / perPage);

                var pageNumber = req.query.page == null ? 1 : req.query.page;

                var startFrom = (pageNumber - 1) * perPage;

                var last = pageNumber - 1;

                var next = last + 2;

                productDetails = await Product.findAll({
                  limit: perPage,
                  offset: startFrom,
                  where: {
                    CompanyName: av,
                    Category: va
                  }
                }); 
                ss = 1;
                
                if(typeof av == 'string' && typeof va == 'string')
                {
                  var tt = "Category=" + va; 
                  var tt1 = "Brand=" + av;
                  tt = tt + "&" + tt1;
                  tt = tt.replace(/,/g,"&");
                  console.log(tt)
                }
                else if(typeof av) {
                  console.log("nnn")
                }
                
                var tt = Object.values(filters.Category);
                var tt1 = Object.values(filters.Brand);

                for(var i=0;i<tt.length;i++){
                  tt[i]="Category="+tt[i];
                }

                for(var i=0;i<tt1.length;i++){
                  tt1[i]="Brand="+tt1[i];
                }
                tt = tt.concat(tt1);
                tt = tt.toString();
                tt = tt.replace(/,/g,"&");
              }
              
              else if(filters.Brand) {
                var av = filters.Brand;

                var countProducts = await Product.count({
                  where: {
                    CompanyName: av
                  }
                });

                var perPage = 6;

                var pages = Math.ceil(countProducts / perPage);

                var pageNumber = req.query.page == null ? 1 : req.query.page;

                var startFrom = (pageNumber - 1) * perPage;

                var last = pageNumber - 1;

                var next = last + 2;

                productDetails = await Product.findAll({
                  limit: perPage,
                  offset: startFrom,
                  where: {
                    CompanyName: av
                  }
                });
                
                ss = 1;
                var tt = Object.values(filters.Brand);

                for(var i=0;i<tt.length;i++){
                  tt[i]="Brand="+tt[i];
                }

                tt = tt.toString();
                tt = tt.replace(/,/g,"&");
              }
              else if(filters.Category){
                
                var av = filters.Category;

                var countProducts = await Product.count({
                  where: {
                    Category: av
                  }
                });

                var perPage = 6;

                var pages = Math.ceil(countProducts / perPage);

                var pageNumber = req.query.page == null ? 1 : req.query.page;

                var startFrom = (pageNumber - 1) * perPage;

                var last = pageNumber - 1;

                var next = last + 2;

                productDetails = await Product.findAll({
                  limit: perPage,
                  offset: startFrom,
                  where: {
                    Category: av
                  }
                });
                
                ss = 1;
                var tt = Object.values(filters.Category);

                for(var i=0;i<tt.length;i++){
                  tt[i]="Category="+tt[i];
                }

                tt = tt.toString();
                tt = tt.replace(/,/g,"&");
                }
              else{
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

                productDetails = await Product.findAll({
                  limit: perPage,
                  offset: startFrom
                });
                
                ss = 0;
              }
            }
            else{
              var condition = 
              { 
                [Op.or]: [ 
                  { 
                    ProductName : {
                      [Op.like]: '%' + ProductName + '%'
                    },
                  },
                  { 
                    CompanyName: {
                      [Op.like]: '%' + ProductName + '%'
                    }
                  },
                  { 
                    Category: {
                      [Op.like]: '%' + ProductName + '%'
                    }
                  },
                  { 
                    SubCategory: {
                      [Op.like]: '%' + ProductName + '%'
                    }
                  }
                ],
              }
              productDetails = await Product.findAll({
                where: condition
              })
              
              if(productDetails.length !== 0)
              {
                var countProducts = await Product.count({
                  where: condition
                });
  
                var perPage = 6;
  
                var pages = Math.ceil(countProducts / perPage);
  
                var pageNumber = req.query.page == null ? 1 : req.query.page;
  
                var startFrom = (pageNumber - 1) * perPage;
  
                var last = pageNumber - 1;
  
                var next = last + 2;
                
                if (pageNumber > pages) {
                  await res.redirect(`/welcome?page=${pages}`);
                } 
  
                productDetails = await Product.findAll({
                  where: condition,
                  limit: perPage,
                  offset: startFrom
                });
                
                ss = 0;
              }
              else {
                productDetails = 0
              }
            }

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
              delete filters.page;
              filters = Object.values(filters);
            
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
                countProducts,
                next,
                pageNumber,
                allUniqueCategory,
                allUniqueCompanyName,
                allUniqueSubCategory,
                ProductName,
                ss,
                tt,
                filters
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
