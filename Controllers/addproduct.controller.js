var express = require("express");
var app = express();
const { sequelize } = require("../models/db");
const { User } = require("../models/user.model");
const { Wallet } = require("../models/wallet.model");
const { Cart } = require("../models/cart.model");
const { Couponcode } = require("../models/couponcode.model");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");
var path = require("path");
const sharp = require('sharp');
const Jimp = require("jimp")
const fs = require('fs')

var cookieParser = require("cookie-parser");
const { ProfileImage } = require("../models/profileImage.model");
const { Product } = require("../models/product.model");
const { ProductImage } = require("../models/productImage.model");
app.use(cookieParser());

exports.getAddProduct = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const userid = req.cookies.userid;

    const aq = await User.findOne({
      where: {
        UserID: userid
      }
    });

    if(aq.UserName !== "admin")
    {
      await res.render("notauthorizederror");
    }
    
    if (!token) {
      res.redirect("login");
      // res.json({
      //   error: "Unauthorized",
      // });
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

              await res.render("addproduct", {
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

exports.postAddProduct = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const userid = req.cookies.userid;

    if (!token) {
      res.redirect("login");
      // res.json({
      //   error: "Unauthorized",
      // });
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

            const {ProductName, SKU, Price, QuantityLeft, CompanyName, Category, SubCategory } = req.body;
            const file = req.files.Image;

            console.log(req.body);
            console.log(file);

            const checkAlready = await Product.findOne({
                where: {
                    ProductName: ProductName,
                    CompanyName: CompanyName
                }
            });

            if(checkAlready){
              const message = "Duplicate product (change either product name or company name)";
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
  
                await res.render("addproduct", {
                  userDetails: userDetails,
                  walletBalance: walletBalance,
                  cartCount: cartCount,
                  countCouponcode: countCouponcode,
                  link: link,
                  ab: ab,
                  message
                });
              }
            }
            if(!checkAlready)
            {
              const addProductTransaction = await sequelize.transaction();
              try{

                const checkSKUAlready = await Product.findOne({
                  where: {
                      SKU : SKU
                  }
                });

                if(checkSKUAlready)
                {
                  const message1 = "Duplicate SKU for product";
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
      
                    await res.render("addproduct", {
                      userDetails: userDetails,
                      walletBalance: walletBalance,
                      cartCount: cartCount,
                      countCouponcode: countCouponcode,
                      link: link,
                      ab: ab,
                      message1
                    });
                  }
                }

                const product = {
                  ProductName: ProductName,
                  SKU: SKU,
                  Price: Price,
                  QuantityLeft: QuantityLeft,
                  CompanyName: CompanyName,
                  Category: Category,
                  SubCategory: SubCategory,
                };
                
                await Product.create(product, {
                  transaction: addProductTransaction
                });

                await addProductTransaction.commit();

                const a = await Product.findOne({
                  order: [
                    ['ProductID', 'DESC'],
                  ],
                  limit: 1,
                });
                
                const a1 = a.ProductID
                console.log("----ProductID-----", a1);
                const ProductID = a1;

                if (
                  file.mimetype == "image/jpeg" ||
                  file.mimetype == "image/png" ||
                  file.mimetype == "image/gif" || 
                  file.mimetype == "image/jpg"
                ) {
                  var ext = path.extname(file.name);
                  var Image = ProductName + "_" + CompanyName + "_" + Category + "_" + SubCategory + ext;
                  var Image1 = ProductName + "__" + CompanyName + "__" + Category + "__" + SubCategory;
                  console.log("Image name", Image);
                    
                  file.mv(
                    "views/images/upload_product_images/" + Image,
                    async function (err) {
                      if (err) await res.status(500).send(err);
                      const addProductImageTransaction = await sequelize.transaction();
                      try{
                        
                        Jimp.read("views/images/upload_product_images/" + Image, function (err, image) {
                          if (err) {
                            console.log(err)
                          } else {
                            image.write("views/images/upload_product_images/" + ProductName + "_" + CompanyName + "_" + Category + "_" + SubCategory + ".png");
                          }
                        })
                        sharp("views/images/upload_product_images/" + Image).resize({ height: 253, width: 448 }).toFile("views/images/upload_product_images/" + Image1 + ".png");
                        Image = Image1 + ".png";
                        const imageUpload = { ProductID, Image };
                        await ProductImage.create(imageUpload, {
                          transaction: addProductImageTransaction
                        });

                        await addProductImageTransaction.commit();

                      }
                      catch{
                        await addProductImageTransaction.rollback();  
                      }
                    }
                  );
                } else {
                  var message1 =
                        "This format is not allowed";
                  await addProductTransaction.rollback();
                  await res.json(message1);
                }
              }
              catch (err) {
                await addProductTransaction.rollback();
                await res.json(err.message);
              }
            }

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

              await res.render("addproduct", {
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