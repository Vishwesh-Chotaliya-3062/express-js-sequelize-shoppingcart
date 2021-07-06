var express = require("express");
var app = express();
const { sequelize } = require("../models/db");
const { User } = require("../models/user.model");
const { Wallet } = require("../models/wallet.model");
const { Cart } = require("../models/cart.model");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

var path = require("path");
const { Op } = require("sequelize");

var cookieParser = require("cookie-parser");
const { Couponcode } = require("../models/couponcode.model");
const { Useraddress } = require("../models/useraddress.model");
const { ProfileImage } = require("../models/profileImage.model");
const { ProductImage } = require("../models/productImage.model");

app.use(cookieParser());

exports.getUserProfile = async (req, res, next) => {
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
            
            const userDetails = await User.findAll({
              attributes: ["UserID", "UserName", "Email", "Status"],
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

            const couponcodeDetails = await Couponcode.findAll({
              where: {
                UserID: userid,
              },
            });

            const userAddress = await Useraddress.findOne({
              where: {
                UserID: userid,
              },
            });

            const ab = await ProfileImage.findOne({
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

              await res.render("userprofile", {
                userDetails: userDetails,
                countProducts: countProducts,
                walletBalance: walletBalance,
                cartCount: cartCount,
                link: link,
                countCouponcode: countCouponcode,
                couponcodeDetails: couponcodeDetails,
                userAddress: userAddress,
                userid: userid,
                ab: ab,
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

exports.getUserAddressProfile = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const userid = req.cookies.userid;
    
    if (!token) {
      res.redirect("/login");
      // res.json({
      //   error: "Unauthorized",
      // });
    } else {
      try {
        console.log("Authentication Token:", token);

        jwt.verify(token, "thisismysecret", async (err, data) => {
          if (err) {
            res.redirect("/login");
          } else {
            console.log("Verified");
            var decoded = jwt_decode(token);
            console.log(decoded);
            var UserName = decoded.UserName;
            await res.cookie("username", UserName);
            console.log("user", UserName);

            var errors = validationResult(req);
            var alert = errors.array();
            if(alert.length > 1)
            {
              alert = alert. splice(0, 1);
              console.log(alert);
            }
            console.log(alert);
            if (!errors.isEmpty()) {
              const userDetails = await User.findAll({
                attributes: ["UserID", "UserName", "Email", "Status"],
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
  
              const couponcodeDetails = await Couponcode.findAll({
                where: {
                  UserID: userid,
                },
              });
  
              const userAddress = await Useraddress.findOne({
                where: {
                  UserID: userid,
                },
              });
  
              const ab = await ProfileImage.findOne({
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
  
                await res.render("userprofile", {
                  userDetails: userDetails,
                  countProducts: countProducts,
                  walletBalance: walletBalance,
                  cartCount: cartCount,
                  link: link,
                  countCouponcode: countCouponcode,
                  couponcodeDetails: couponcodeDetails,
                  userAddress: userAddress,
                  userid: userid,
                  ab: ab,
                  alert: alert
                });
              }
            }
            else{
              const {
                UserProfileName,
                UserProfileEmail,
                addr,
                addrCity,
                addrState,
                addrZip,
                addrCountry,
              } = req.body;
              // const UserName = UserProfileName;
              // const Email = UserProfileEmail;
              const UserID = userid;
              const Address = addr;
              const City = addrCity;
              const State = addrState;
              const Zipcode = addrZip;
              const Country = addrCountry;
              const useraddress = {
                UserID,
                Address,
                City,
                State,
                Zipcode,
                Country,
              };
  
              console.log(req.body);
  
              const userAddress = await Useraddress.findOne({
                where: {
                  UserID: userid,
                },
              });
  
              const user1 = await User.findOne({
                where: {
                  UserID: userid,
                },
              });
  
              const userExist = await User.findOne({
                where: {
                  UserName: UserProfileName,
                  UserID: { [Op.notIn]: [userid] },
                },
              });
  
              const emailExist = await User.findOne({
                where: {
                  Email: UserProfileEmail,
                  UserID: { [Op.notIn]: [userid] },
                },
              });
  
              if (!emailExist) {
                if (UserProfileName !== user1.UserName) {
                  if (userExist) {
                    var msg = "Username already exists";
                    // await res.redirect("/userprofile")
  
                    const userDetails = await User.findAll({
                      attributes: ["UserID", "UserName", "Email", "Status"],
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
        
                    const couponcodeDetails = await Couponcode.findAll({
                      where: {
                        UserID: userid,
                      },
                    });
        
                    const userAddress = await Useraddress.findOne({
                      where: {
                        UserID: userid,
                      },
                    });
        
                    const ab = await ProfileImage.findOne({
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
        
                      await res.render("userprofile", {
                        userDetails: userDetails,
                        countProducts: countProducts,
                        walletBalance: walletBalance,
                        cartCount: cartCount,
                        link: link,
                        countCouponcode: countCouponcode,
                        couponcodeDetails: couponcodeDetails,
                        userAddress: userAddress,
                        userid: userid,
                        ab: ab,
                        msg: msg
                      });
                    }
  
                  } else {
                    const a = await User.update(
                      {
                        UserName: UserProfileName,
                      },
                      {
                        where: {
                          UserID: userid,
                        },
                      }
                    );
                    
                    if (req.files.UserProfileImage) {
                      var file = req.files.UserProfileImage;
        
                      // if (UserProfileImage){
                      if (
                        file.mimetype == "image/jpeg" ||
                        file.mimetype == "image/png" ||
                        file.mimetype == "image/gif"
                      ) {
                        var ext = path.extname(file.name);
                        var Image = UserID + "_Profile" + ext;
        
                        const ab = await ProfileImage.findOne({
                          where: {
                            UserID: UserID,
                          },
                        });
                        if (ab) {
                          await ProfileImage.destroy({
                            where: {
                              UserID: UserID,
                            },
                          });
                        }
        
                        file.mv(
                          "views/images/upload_images/" + Image,
                          async function (err) {
                            if (err) return res.status(500).send(err);
                            const imageUpload = { UserID, Image };
                            await ProfileImage.create(imageUpload);
                          }
                        );
                      } else {
                        message =
                          "This format is not allowed";
                          const userDetails = await User.findAll({
                            attributes: ["UserID", "UserName", "Email", "Status"],
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
              
                          const couponcodeDetails = await Couponcode.findAll({
                            where: {
                              UserID: userid,
                            },
                          });
              
                          const userAddress = await Useraddress.findOne({
                            where: {
                              UserID: userid,
                            },
                          });
              
                          const ab = await ProfileImage.findOne({
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
              
                            await res.render("userprofile", {
                              userDetails: userDetails,
                              countProducts: countProducts,
                              walletBalance: walletBalance,
                              cartCount: cartCount,
                              link: link,
                              countCouponcode: countCouponcode,
                              couponcodeDetails: couponcodeDetails,
                              userAddress: userAddress,
                              userid: userid,
                              ab: ab,
                              message: message
                            });
                          }
                      }
                    }
                    
                    if (!userAddress) {
                      console.log("not");
                      await Useraddress.create(useraddress);
                    } else {
                      await Useraddress.update(
                        {
                          Address: addr,
                          City: addrCity,
                          State: addrState,
                          Zipcode: addrZip,
                          Country: addrCountry,
                        },
                        {
                          where: {
                            UserID: userid,
                          },
                        }
                      );
                    }
                    
                    await res.redirect("/login");
                  }
                }
              }
  
              if (!userExist) {
                if (UserProfileEmail !== user1.Email) {
                  if (emailExist) {
                    var msg1 = "Email already exists";
                    const userDetails = await User.findAll({
                      attributes: ["UserID", "UserName", "Email", "Status"],
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
        
                    const couponcodeDetails = await Couponcode.findAll({
                      where: {
                        UserID: userid,
                      },
                    });
        
                    const userAddress = await Useraddress.findOne({
                      where: {
                        UserID: userid,
                      },
                    });
        
                    const ab = await ProfileImage.findOne({
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
        
                      await res.render("userprofile", {
                        userDetails: userDetails,
                        countProducts: countProducts,
                        walletBalance: walletBalance,
                        cartCount: cartCount,
                        link: link,
                        countCouponcode: countCouponcode,
                        couponcodeDetails: couponcodeDetails,
                        userAddress: userAddress,
                        userid: userid,
                        ab: ab,
                        msg1: msg1
                      });
                    }
  
                  } else {
                    const a = await User.update(
                      {
                        Email: UserProfileEmail,
                      },
                      {
                        where: {
                          UserID: userid,
                        },
                      }
                    );
  
                    if (req.files.UserProfileImage) {
                      var file = req.files.UserProfileImage;
        
                      // if (UserProfileImage){
                      if (
                        file.mimetype == "image/jpeg" ||
                        file.mimetype == "image/png" ||
                        file.mimetype == "image/gif"
                      ) {
                        var ext = path.extname(file.name);
                        var Image = UserID + "_Profile" + ext;
        
                        const ab = await ProfileImage.findOne({
                          where: {
                            UserID: UserID,
                          },
                        });
                        if (ab) {
                          await ProfileImage.destroy({
                            where: {
                              UserID: UserID,
                            },
                          });
                        }
        
                        file.mv(
                          "views/images/upload_images/" + Image,
                          async function (err) {
                            if (err) return res.status(500).send(err);
                            const imageUpload = { UserID, Image };
                            await ProfileImage.create(imageUpload);
                          }
                        );
                      } else {
                        message =
                          "This format is not allowed";
                          const userDetails = await User.findAll({
                            attributes: ["UserID", "UserName", "Email", "Status"],
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
              
                          const couponcodeDetails = await Couponcode.findAll({
                            where: {
                              UserID: userid,
                            },
                          });
              
                          const userAddress = await Useraddress.findOne({
                            where: {
                              UserID: userid,
                            },
                          });
              
                          const ab = await ProfileImage.findOne({
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
              
                            await res.render("userprofile", {
                              userDetails: userDetails,
                              countProducts: countProducts,
                              walletBalance: walletBalance,
                              cartCount: cartCount,
                              link: link,
                              countCouponcode: countCouponcode,
                              couponcodeDetails: couponcodeDetails,
                              userAddress: userAddress,
                              userid: userid,
                              ab: ab,
                              message: message
                            });
                          }
                      }
                    }
  
                    if (!userAddress) {
                      console.log("not");
                      await Useraddress.create(useraddress);
                    } else {
                      await Useraddress.update(
                        {
                          Address: addr,
                          City: addrCity,
                          State: addrState,
                          Zipcode: addrZip,
                          Country: addrCountry,
                        },
                        {
                          where: {
                            UserID: userid,
                          },
                        }
                      );
                    }
  
                    await res.redirect("/login");
                  }
                }
              }
              
              if(!userExist && !emailExist)
              {
                if (!userAddress) {
                  console.log("not");
                  await Useraddress.create(useraddress);
                } else {
                  await Useraddress.update(
                    {
                      Address: addr,
                      City: addrCity,
                      State: addrState,
                      Zipcode: addrZip,
                      Country: addrCountry,
                    },
                    {
                      where: {
                        UserID: userid,
                      },
                    }
                  );
                }
                
                if (req.files.UserProfileImage) {
                  var file = req.files.UserProfileImage;
    
                  // if (UserProfileImage){
                    if (
                      file.mimetype == "image/jpeg" ||
                      file.mimetype == "image/png" ||
                      file.mimetype == "image/gif"
                    ) {
                      var ext = path.extname(file.name);
                      var Image = UserID + "_Profile" + ext;
      
                      const ab = await ProfileImage.findOne({
                        where: {
                          UserID: UserID,
                        },
                      });
                      if (ab) {
                        await ProfileImage.destroy({
                          where: {
                            UserID: UserID,
                          },
                        });
                      }
      
                      file.mv(
                        "views/images/upload_images/" + Image,
                        async function (err) {
                          if (err) return res.status(500).send(err);
                          const imageUpload = { UserID, Image };
                          await ProfileImage.create(imageUpload);
                        }
                      );
                    } else {
                      message =
                            "This format is not allowed";
                            const userDetails = await User.findAll({
                              attributes: ["UserID", "UserName", "Email", "Status"],
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
                
                            const couponcodeDetails = await Couponcode.findAll({
                              where: {
                                UserID: userid,
                              },
                            });
                
                            const userAddress = await Useraddress.findOne({
                              where: {
                                UserID: userid,
                              },
                            });
                
                            const ab = await ProfileImage.findOne({
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
                
                              await res.render("userprofile", {
                                userDetails: userDetails,
                                countProducts: countProducts,
                                walletBalance: walletBalance,
                                cartCount: cartCount,
                                link: link,
                                countCouponcode: countCouponcode,
                                couponcodeDetails: couponcodeDetails,
                                userAddress: userAddress,
                                userid: userid,
                                ab: ab,
                                message: message
                              });
                            }
                    }
                }
              }
              if(userExist && emailExist){
                    var msg = "User already exists";
                    const userDetails = await User.findAll({
                      attributes: ["UserID", "UserName", "Email", "Status"],
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
        
                    const couponcodeDetails = await Couponcode.findAll({
                      where: {
                        UserID: userid,
                      },
                    });
        
                    const userAddress = await Useraddress.findOne({
                      where: {
                        UserID: userid,
                      },
                    });
        
                    const ab = await ProfileImage.findOne({
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
        
                      await res.render("userprofile", {
                        userDetails: userDetails,
                        countProducts: countProducts,
                        walletBalance: walletBalance,
                        cartCount: cartCount,
                        link: link,
                        countCouponcode: countCouponcode,
                        couponcodeDetails: couponcodeDetails,
                        userAddress: userAddress,
                        userid: userid,
                        ab: ab,
                        msg: msg
                      });
                    }
              }
      
              await res.redirect("/userprofile");
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