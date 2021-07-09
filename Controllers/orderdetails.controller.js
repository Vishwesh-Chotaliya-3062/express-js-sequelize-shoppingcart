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
const { Useraddress } = require("../models/useraddress.model");
const { OrderDetail, Order } = require("../models/order.model");
const { ProfileImage } = require("../models/profileImage.model");
app.use(cookieParser());

exports.getCart = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const cookieuserid = req.cookies.userid;

    const aq = await User.findOne({
      where: {
        UserID: cookieuserid
      }
    });

    if(aq.UserName === "admin")
    {
      await res.render("notauthorizederror");
    }

    cookieflag = req.cookies.flag;
    console.log("Flag", cookieflag);

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

            const userDetails = await User.findAll({
              attributes: ["UserID", "UserName", "Email", "Status"],
              include: Wallet,
              where: {
                UserName: UserName,
              },
            });

            const countCouponcode = await Couponcode.count({
              where: {
                UserID: cookieuserid,
              },
            });

            const ab = await ProfileImage.findOne({
              where: {
                UserID: cookieuserid,
              }
            });

            const useraddress = await Useraddress.findOne({
              where: {
                UserID: cookieuserid,
              },
            });

            const couponcodeDetails = await Couponcode.findAll({
              where: {
                UserID: cookieuserid,
              },
            });

            const cartSubTotalPrice = await Cart.findOne({
              attributes: [
                [sequelize.fn("SUM", sequelize.col("Total")), "Total"],
              ],
              where: {
                UserID: cookieuserid,
              },
            });

            if (cookieflag == 1) {
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
                    [
                      sequelize.fn("SUM", sequelize.col("Quantity")),
                      "Quantity",
                    ],
                  ],
                  where: {
                    UserID: userid,
                  },
                });

                const discountPrice = cartSubTotalPrice.Total * 0.5;

                const cartTotalPrice = cartSubTotalPrice.Total - discountPrice;

                const cartCount = cartTotalQuantity.Quantity;

                const walletBalance = Math.ceil(
                  userDetails[user].wallet.Balance
                );

                const sufficientBalance = cartTotalPrice - walletBalance;

                await Couponcode.update(
                  {
                    Status: "applied",
                  },
                  {
                    where: {
                      UserID: userid,
                    },
                  }
                );

                const user1 = await User.findOne({
                  attributes: ["UserID", "UserName", "Email"],
                  where: {
                    UserID: userid,
                  },
                  include: {
                    model: Cart,
                    include: {
                      model: Product,
                    },
                  },
                });

                const sum = await Cart.findOne({
                  attributes: [
                    [sequelize.fn("SUM", sequelize.col("Total")), "Total"],
                  ],
                  where: {
                    UserID: userid,
                  },
                });

                const cartDetail = await user1.carts.map((i) => {
                  return {
                    productProductID: i.ProductID,
                    Quantity: i.Quantity,
                    Total: i.Quantity * i.product.Price,
                  };
                });

                await Order.destroy({
                  where: {
                    Status: "pending",
                    userUserID: userid,
                  },
                });
                console.log("hello", sum.Total);

                const purchaseTotal = sum.Total - discountPrice;

                const coupon = await Couponcode.findOne({
                  where: {
                    UserID : userid
                  }
                });

                console.log(coupon.Details);

                let orderData = {
                  userUserID: userid,
                  TotalAmount: sum.Total,
                  DiscountedAmount: discountPrice,
                  PurchaseTotal: purchaseTotal,
                  orderdetails: cartDetail,
                  Status: "pending",
                  Remark: "payment pending",
                  Coupon: coupon.Details,
                };

                const order = await Order.create(orderData, {
                  include: {
                    model: OrderDetail,
                  },
                });

                await Couponcode.update(
                  {
                    Status: "not applied",
                  },
                  {
                    where: {
                      UserID: userid,
                    },
                  }
                );

                const Data = await OrderDetail.findOne({
                  include: {
                    model: Order,
                    where: {
                      userUserID: userid,
                      Status: "pending",
                    },
                  },
                });

                console.log(Data);

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
                  cartTotalPrice: cartTotalPrice,
                  useraddress: useraddress,
                  sufficientBalance: sufficientBalance,
                  Data: Data,
                  ab: ab
                });
              }
            } else {
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
                    [
                      sequelize.fn("SUM", sequelize.col("Quantity")),
                      "Quantity",
                    ],
                  ],
                  where: {
                    UserID: userid,
                  },
                });

                const discountPrice = 0;

                const cartTotalPrice = cartSubTotalPrice.Total - discountPrice;

                const cartCount = cartTotalQuantity.Quantity;

                const walletBalance = Math.ceil(
                  userDetails[user].wallet.Balance
                );

                const user1 = await User.findOne({
                  attributes: ["UserID", "UserName", "Email"],
                  where: {
                    UserID: userid,
                  },
                  include: {
                    model: Cart,
                    include: {
                      model: Product,
                    },
                  },
                });

                const sum = await Cart.findOne({
                  attributes: [
                    [sequelize.fn("SUM", sequelize.col("Total")), "Total"],
                  ],
                  where: {
                    UserID: userid,
                  },
                });

                const cartDetail = await user1.carts.map((i) => {
                  return {
                    productProductID: i.ProductID,
                    Quantity: i.Quantity,
                    Total: i.Quantity * i.product.Price,
                  };
                });

                await Order.destroy({
                  where: {
                    Status: "pending",
                    userUserID: userid,
                  },
                });

                const purchaseTotal = sum.Total - discountPrice;

                let orderData = {
                  userUserID: userid,
                  TotalAmount: sum.Total,
                  DiscountedAmount: discountPrice,
                  PurchaseTotal: purchaseTotal,
                  orderdetails: cartDetail,
                  Status: "pending",
                  Remark: "payment pending",
                  Coupon: "No"
                };

                const order = await Order.create(orderData, {
                  include: {
                    model: OrderDetail,
                  },
                });

                await Couponcode.update(
                  {
                    Status: "not applied",
                  },
                  {
                    where: {
                      UserID: userid,
                    },
                  }
                );

                const Data = await OrderDetail.findOne({
                  include: {
                    model: Order,
                    where: {
                      userUserID: userid,
                      Status: "pending",
                    },
                  },
                });

                console.log(Data);

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
                  cartTotalPrice: cartTotalPrice,
                  useraddress: useraddress,
                  Data: Data,
                  ab: ab
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

    const aq = await User.findOne({
      where: {
        UserID: UserID
      }
    });

    if(aq.UserName === "admin")
    {
      await res.render("notauthorizederror");
    }

  const CouponCode = req.body.CouponCode;

  console.log("Userid:", UserID);

  console.log("Coupon Code:", CouponCode);

  try {
    const userCouponCode = await Couponcode.findOne({
      where: {
        UserID: UserID,
      },
    });

    console.log("user coupon", userCouponCode.CouponCode);
    let flag = 0;

    if (CouponCode !== userCouponCode.CouponCode) {
      flag = 0;
      res.cookie("flag", flag);
      return res.redirect("/orderdetails");
    } else {
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
    let flag = 0;
    res.clearCookie("flag");
    res.cookie("flag", flag);
    return res.redirect("/orderdetails");
  } catch (e) {
    console.log(e);
    return res.send(500).send("Something went wrong!");
  }
};

exports.getPayment = async (req, res, next) => {
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
    const orderId = req.params.orderId;

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
              }
            });

            const countCouponcode = await Couponcode.count({
              where: {
                UserID: userid,
              },
            });

            const userAddress = await Useraddress.findOne({
              where: {
                UserID: userid,
              },
            });

            if (!userAddress) {
              res.redirect("/orderdetails");
            }

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

              console.log(orderId);

              const Data = await Order.findOne({
                where: {
                  userUserID: userid,
                  id: orderId,
                },
                include: {
                  model: OrderDetail,
                  include: {
                    model: Product,
                  },
                },
              });

              if (!Data) {
                res.render("error");
              }

              console.log(Data);

              const cartCount = cartTotalQuantity.Quantity;

              const walletBalance = Math.ceil(userDetails[user].wallet.Balance);

              const sufficientBalance = Data.PurchaseTotal - walletBalance;

              await res.render("payment", {
                userDetails: userDetails,
                countProducts: countProducts,
                walletBalance: walletBalance,
                productQuantity: productQuantity,
                cartCount: cartCount,
                countCouponcode: countCouponcode,
                Data: Data,
                sufficientBalance: sufficientBalance,
                orderId: orderId,
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

exports.getStatus = async (req, res, next) => {
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
    const orderId = req.params.orderId;
    const flag = req.cookies.flag;

    if (req.cookies.Refresh) {
      res.clearCookie("Refresh");
      res.redirect("/welcome");
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
            
            const result = await sequelize.transaction();

            try {
              const userAddress = await Useraddress.findOne({
                where: {
                  UserID: userid,
                },
              });

              const newAddress = userAddress.Address;
              const newCity = userAddress.City + "-" + userAddress.Zipcode;
              const newAll = userAddress.State + ", " + userAddress.Country;

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
                    [
                      sequelize.fn("SUM", sequelize.col("Quantity")),
                      "Quantity",
                    ],
                  ],
                  where: {
                    UserID: userid,
                  },
                });

                console.log(orderId);

                const Data = await Order.findOne({
                  where: {
                    userUserID: userid,
                    id: orderId,
                  },
                  include: {
                    model: OrderDetail,
                    include: {
                      model: Product,
                    },
                  },
                });

                const orderOrderDetails = Data.orderdetails;
                const ID = [];
                const Quantity = [];
                const QuantityLeft = [];

                for (u in orderOrderDetails) {
                  ID.push(orderOrderDetails[u].product.ProductID);
                  Quantity.push(orderOrderDetails[u].Quantity);
                  QuantityLeft.push(orderOrderDetails[u].product.QuantityLeft);

                  if (orderOrderDetails[u].product.QuantityLeft < 1) {
                    throw new Error(`One of the items is out of stock`);
                  } else if (
                    orderOrderDetails[u].product.QuantityLeft <
                    orderOrderDetails[u].Quantity
                  ) {
                    throw new Error(`One of the items is out of stock`);
                  }
                }

                const flagT = await sequelize.transaction();
                try {
                  if (flag == 0) {
                    throw new Error(`No coupon`);
                  }

                  await Couponcode.update(
                    {
                      Status: "used",
                    },
                    {
                      where: {
                        UserID: userid,
                      },
                    },
                    {
                      transaction: flagT,
                    }
                  );

                  await flagT.commit();
                } catch {
                  await flagT.rollback();
                }

                const cartCount = cartTotalQuantity.Quantity;

                const walletBalance = Math.ceil(
                  userDetails[user].wallet.Balance
                );

                const sufficientBalance = Data.PurchaseTotal - walletBalance;

                const updatedBalance = walletBalance - Data.PurchaseTotal;

                const walletT = await sequelize.transaction();
                try {
                  await Wallet.update(
                    {
                      Balance: updatedBalance,
                    },
                    {
                      where: {
                        UserID: userid,
                      },
                    },
                    {
                      transaction: walletT,
                    }
                  );

                  await walletT.commit();
                } catch {
                  await walletT.rollback();
                }

                const succesT = await sequelize.transaction();
                try {
                  await Order.update(
                    {
                      Status: "success",
                      Remark: "order placed",
                    },
                    {
                      where: {
                        userUserID: userid,
                        id: orderId,
                      },
                    },
                    {
                      transaction: succesT,
                    }
                  );

                  await succesT.commit();
                } catch {
                  await succesT.rollback();
                }

                console.log("ID", ID);
                console.log("Quantity", Quantity);
                console.log("Quantity Left", QuantityLeft);

                for (u in orderOrderDetails) {
                  const minus =
                    orderOrderDetails[u].product.QuantityLeft -
                    orderOrderDetails[u].Quantity;
                  console.log(minus);

                  await Product.update(
                    {
                      QuantityLeft: minus,
                    },
                    {
                      where: {
                        ProductID: orderOrderDetails[u].productProductID,
                      },
                    },
                    {
                      transaction: result,
                    }
                  );
                }

                await result.commit();

                res.cookie("Refresh", 0);

                const Data1 = await Order.findOne({
                  where: {
                    userUserID: userid,
                    id: orderId,
                  },
                  include: {
                    model: OrderDetail,
                    include: {
                      model: Product,
                    },
                  },
                });

                const walletUser = await Wallet.findOne({
                  where: {
                    UserID: userid,
                  },
                });

                let userWalletUpdatedBalance = walletUser.Balance;
                userWalletUpdatedBalance = Math.ceil(userWalletUpdatedBalance);
                console.log(userWalletUpdatedBalance);

                let itemsCount = await OrderDetail.findOne({
                  attributes: [
                    [
                      sequelize.fn("SUM", sequelize.col("Quantity")),
                      "Quantity",
                    ],
                  ],
                  where: {
                    orderId: orderId,
                  },
                });

                itemsCount = itemsCount.Quantity;
                console.log(itemsCount);

                await res.render("status", {
                  userDetails: userDetails,
                  countProducts: countProducts,
                  walletBalance: walletBalance,
                  productQuantity: productQuantity,
                  cartCount: cartCount,
                  countCouponcode: countCouponcode,
                  Data: Data,
                  sufficientBalance: sufficientBalance,
                  orderId: orderId,
                  orderOrderDetails: orderOrderDetails,
                  Data1: Data1,
                  itemsCount: itemsCount,
                  userWalletUpdatedBalance: userWalletUpdatedBalance,
                  newAddress: newAddress,
                  newCity: newCity,
                  newAll: newAll,
                  ab: ab
                });
              }
            } catch (err) {
              await result.rollback();

              await Order.update(
                {
                  Status: "failed",
                  Remark: "out of stock",
                },
                {
                  where: {
                    userUserID: userid,
                    id: orderId,
                  },
                }
              );

              const ab = await ProfileImage.findOne({
                where: {
                  UserID: userid,
                }
              });

              const userAddress = await Useraddress.findOne({
                where: {
                  UserID: userid,
                },
              });

              const newAddress = userAddress.Address;
              const newCity = userAddress.City + "-" + userAddress.Zipcode;
              const newAll = userAddress.State + ", " + userAddress.Country;

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
                    [
                      sequelize.fn("SUM", sequelize.col("Quantity")),
                      "Quantity",
                    ],
                  ],
                  where: {
                    UserID: userid,
                  },
                });

                console.log(orderId);

                const Data = await Order.findOne({
                  where: {
                    userUserID: userid,
                    id: orderId,
                  },
                  include: {
                    model: OrderDetail,
                    include: {
                      model: Product,
                    },
                  },
                });

                if (!Data) {
                  res.render("error");
                }

                console.log(Data.Status);

                const orderOrderDetails = Data.orderdetails;

                const cartCount = cartTotalQuantity.Quantity;

                const walletBalance = Math.ceil(
                  userDetails[user].wallet.Balance
                );

                const sufficientBalance = Data.PurchaseTotal - walletBalance;

                const Data1 = await Order.findOne({
                  where: {
                    userUserID: userid,
                    id: orderId,
                  },
                  include: {
                    model: OrderDetail,
                    include: {
                      model: Product,
                    },
                  },
                });

                const outofstock = [];

                for (u in Data1.orderdetails) {
                  if (Data1.orderdetails[u].product.QuantityLeft < 1) {
                    console.log("false");
                  }
                  if (
                    Data1.orderdetails[u].product.QuantityLeft <
                    Data1.orderdetails[u].Quantity
                  ) {
                    console.log("false");
                    outofstock.push(
                      " " + Data1.orderdetails[u].product.ProductName
                    );
                  }
                }
                console.log(outofstock);

                const walletUser = await Wallet.findOne({
                  where: {
                    UserID: userid,
                  },
                });

                let userWalletUpdatedBalance = walletUser.Balance;
                userWalletUpdatedBalance = Math.ceil(userWalletUpdatedBalance);

                let itemsCount = await OrderDetail.findOne({
                  attributes: [
                    [
                      sequelize.fn("SUM", sequelize.col("Quantity")),
                      "Quantity",
                    ],
                  ],
                  where: {
                    orderId: orderId,
                  },
                });

                itemsCount = itemsCount.Quantity;

                await res.render("status", {
                  userDetails: userDetails,
                  countProducts: countProducts,
                  walletBalance: walletBalance,
                  productQuantity: productQuantity,
                  cartCount: cartCount,
                  countCouponcode: countCouponcode,
                  Data: Data,
                  sufficientBalance: sufficientBalance,
                  orderId: orderId,
                  orderOrderDetails: orderOrderDetails,
                  Data1: Data1,
                  outofstock: outofstock,
                  userWalletUpdatedBalance: userWalletUpdatedBalance,
                  itemsCount: itemsCount,
                  newAddress: newAddress,
                  newCity: newCity,
                  newAll: newAll,
                  ab: ab
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
