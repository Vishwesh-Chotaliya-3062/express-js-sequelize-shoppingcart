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
const sharp = require("sharp");
const Jimp = require("jimp");
var fs = require("fs");
const { Op } = require("sequelize");

var cookieParser = require("cookie-parser");
const { ProfileImage } = require("../models/profileImage.model");
const { Product } = require("../models/product.model");
const { ProductImage } = require("../models/productImage.model");
app.use(cookieParser());

exports.getEditProduct = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const userid = req.cookies.userid;
    const productid = req.params.productid;

    const aq = await User.findOne({
      where: {
        UserID: userid,
      },
    });

    if (aq.UserName !== "admin") {
      await res.render("notauthorizederror");
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

            const productDetails = await Product.findOne({
              where: {
                ProductID: productid,
              },
            });

            const productImage = await ProductImage.findOne({
              where: {
                ProductID: productid,
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

              await res.render("editproduct", {
                userDetails: userDetails,
                walletBalance: walletBalance,
                cartCount: cartCount,
                countCouponcode: countCouponcode,
                link: link,
                ab: ab,
                productDetails: productDetails,
                productImage: productImage,
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

exports.postEditProduct = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const userid = req.cookies.userid;
    const productid = req.params.productid;

    const aq = await User.findOne({
      where: {
        UserID: userid,
      },
    });

    if (aq.UserName !== "admin") {
      await res.render("notauthorizederror");
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

            if (req.files) {
              const {
                ProductName,
                SKU,
                Price,
                QuantityLeft,
                CompanyName,
                Category,
                SubCategory,
              } = req.body;

              var file = req.files.Image;

              const checkAlready = await Product.findOne({
                where: {
                  ProductName: ProductName,
                  CompanyName: CompanyName,
                  ProductID: {
                    [Op.not]: productid,
                  },
                },
              });

              if (checkAlready) {
                const message =
                  "Duplicate product (change either product name or company name)";
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

                const productDetails = await Product.findOne({
                  where: {
                    ProductID: productid,
                  },
                });

                const productImage = await ProductImage.findOne({
                  where: {
                    ProductID: productid,
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

                  await res.render("editproduct", {
                    userDetails: userDetails,
                    walletBalance: walletBalance,
                    cartCount: cartCount,
                    countCouponcode: countCouponcode,
                    link: link,
                    ab: ab,
                    message,
                    productDetails: productDetails,
                    productImage: productImage,
                  });
                }
              }
              if (!checkAlready) {
                console.log("Not already");
                const addProductTransaction = await sequelize.transaction();
                try {
                  const checkSKUAlready = await Product.findOne({
                    where: {
                      SKU: SKU,
                      ProductID: {
                        [Op.not]: productid,
                      },
                    },
                  });

                  if (checkSKUAlready) {
                    const message1 = "Duplicate SKU for product";
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

                    const productDetails = await Product.findOne({
                      where: {
                        ProductID: productid,
                      },
                    });

                    const productImage = await ProductImage.findOne({
                      where: {
                        ProductID: productid,
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

                      await res.render("editproduct", {
                        userDetails: userDetails,
                        walletBalance: walletBalance,
                        cartCount: cartCount,
                        countCouponcode: countCouponcode,
                        link: link,
                        ab: ab,
                        message1,
                        productDetails: productDetails,
                        productImage: productImage,
                      });
                    }
                  }

                  await Product.update(
                    {
                      ProductName: ProductName,
                      SKU: SKU,
                      Price: Price,
                      QuantityLeft: QuantityLeft,
                      CompanyName: CompanyName,
                      Category: Category,
                      SubCategory: SubCategory,
                    },
                    {
                      where: {
                        ProductID: productid,
                      },
                    },
                    {
                      transaction: addProductTransaction,
                    }
                  );

                  await addProductTransaction.commit();

                  if (
                    file.mimetype == "image/jpeg" ||
                    file.mimetype == "image/png" ||
                    file.mimetype == "image/gif" ||
                    file.mimetype == "image/jpg"
                  ) {
                    var ext = path.extname(file.name);
                    var Image =
                      ProductName +
                      "_" +
                      CompanyName +
                      "_" +
                      Category +
                      "_" +
                      SubCategory +
                      ext;
                    var Image1 =
                      ProductName +
                      "__" +
                      CompanyName +
                      "__" +
                      Category +
                      "__" +
                      SubCategory;

                    file.mv(
                      "views/images/upload_product_images/" + Image,
                      async function (err) {
                        if (err) await res.status(500).send(err);
                        const addProductImageTransaction =
                          await sequelize.transaction();
                        try {
                          Jimp.read(
                            "views/images/upload_product_images/" + Image,
                            function (err, image) {
                              if (err) {
                              } else {
                                image.write(
                                  "views/images/upload_product_images/" +
                                    ProductName +
                                    "_" +
                                    CompanyName +
                                    "_" +
                                    Category +
                                    "_" +
                                    SubCategory +
                                    ".png"
                                );
                              }
                            }
                          );
                          sharp("views/images/upload_product_images/" + Image)
                            .resize({ height: 253, width: 448 })
                            .toFile(
                              "views/images/upload_product_images/" +
                                Image1 +
                                ".png"
                            );
                          Image = Image1 + ".png";
                          const productImageCheck = await ProductImage.findOne({
                            where: {
                              ProductID: productid,
                            },
                          });
                          if (productImageCheck) {
                            await ProductImage.update(
                              { Image: Image },
                              {
                                where: {
                                  ProductID: productid,
                                },
                              },
                              {
                                transaction: addProductImageTransaction,
                              }
                            );
                          } else {
                            await ProductImage.create({
                              ProductID: productid,
                              Image: Image,
                            });
                          }

                          await addProductImageTransaction.commit();
                        } catch {
                          await addProductImageTransaction.rollback();
                        }
                      }
                    );
                  } else {
                    var message1 = "This format is not allowed";
                    await addProductTransaction.rollback();
                    await res.json(message1);
                  }
                } catch (err) {
                  await addProductTransaction.rollback();
                  await res.json(err.message);
                }
              }

              await res.redirect("/manageproducts");
            } else if (!req.files) {
              console.log("body part");
              const {
                ProductName,
                SKU,
                Price,
                QuantityLeft,
                CompanyName,
                Category,
                SubCategory,
              } = req.body;

              const checkAlready = await Product.findOne({
                where: {
                  ProductName: ProductName,
                  CompanyName: CompanyName,
                  ProductID: {
                    [Op.not]: productid,
                  },
                },
              });

              if (checkAlready) {
                console.log("Already product name");
                const message =
                  "Duplicate product (change either product name or company name)";
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

                const productDetails = await Product.findOne({
                  where: {
                    ProductID: productid,
                  },
                });

                const productImage = await ProductImage.findOne({
                  where: {
                    ProductID: productid,
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

                  await res.render("editproduct", {
                    userDetails: userDetails,
                    walletBalance: walletBalance,
                    cartCount: cartCount,
                    countCouponcode: countCouponcode,
                    link: link,
                    ab: ab,
                    message,
                    productDetails: productDetails,
                    productImage: productImage,
                  });
                }
              }
              if (!checkAlready) {
                const updateProductTransaction = await sequelize.transaction();
                try {
                  const checkSKUAlready = await Product.findOne({
                    where: {
                      SKU: SKU,
                      ProductID: {
                        [Op.not]: productid,
                      },
                    },
                  });

                  if (checkSKUAlready) {
                    const message1 = "Duplicate SKU for product";
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

                    const productDetails = await Product.findOne({
                      where: {
                        ProductID: productid,
                      },
                    });

                    const productImage = await ProductImage.findOne({
                      where: {
                        ProductID: productid,
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

                      await res.render("editproduct", {
                        userDetails: userDetails,
                        walletBalance: walletBalance,
                        cartCount: cartCount,
                        countCouponcode: countCouponcode,
                        link: link,
                        ab: ab,
                        message1,
                        productDetails: productDetails,
                        productImage: productImage,
                      });
                    }
                  }

                  await Product.update(
                    {
                      ProductName: ProductName,
                      SKU: SKU,
                      Price: Price,
                      QuantityLeft: QuantityLeft,
                      CompanyName: CompanyName,
                      Category: Category,
                      SubCategory: SubCategory,
                    },
                    {
                      where: {
                        ProductID: productid,
                      },
                    },
                    {
                      transaction: updateProductTransaction,
                    }
                  );

                  await updateProductTransaction.commit();

                  var Image1 =
                    ProductName +
                    "__" +
                    CompanyName +
                    "__" +
                    Category +
                    "__" +
                    SubCategory +
                    ".png";

                  const updateProductImageTransaction =
                    await sequelize.transaction();

                  try {
                    const q1 = await ProductImage.findOne({
                      where: {
                        ProductID: productid,
                      },
                    });
                    console.log(q1.Image);
                    fs.renameSync(
                      "views/images/upload_product_images/" + q1.Image,
                      "views/images/upload_product_images/" + Image1
                    );

                    await ProductImage.update(
                      { Image: Image1 },
                      {
                        where: {
                          ProductID: productid,
                        },
                      },
                      {
                        transaction: updateProductImageTransaction,
                      }
                    );

                    await updateProductImageTransaction.commit();
                  } catch (err) {
                    console.log(err.message);
                    await updateProductImageTransaction.rollback();
                  }
                } catch (err) {
                  await updateProductTransaction.rollback();
                  await res.json(err.message);
                }
              }

              await res.redirect("/manageproducts");
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
