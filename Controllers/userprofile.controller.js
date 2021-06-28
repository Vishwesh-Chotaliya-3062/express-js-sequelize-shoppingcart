var express = require("express");
var app = express();
const { sequelize } = require("../models/db");
const { User } = require("../models/user.model");
const { Wallet } = require("../models/wallet.model");
const { Cart } = require("../models/cart.model");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");
var path = require('path');

var cookieParser = require("cookie-parser");
const { Couponcode } = require("../models/couponcode.model");
const { Useraddress } = require("../models/useraddress.model");
const { ProfileImage } = require("../models/profileImage.model");
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
            const UserID = req.params.userid;
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

            if (!req.files)
              return res.status(400).send("No files were uploaded.");
            var file = req.files.UserProfileImage;
            var ext = path.extname(file.name);
            console.log(ext);
            var Image = UserID + "_Profile" + ext;
        
            console.log(Image);
            const ab = await ProfileImage.findOne({
              where: {
                UserID: UserID,
              }
            });
            if(ab){
              await ProfileImage.destroy({
                where: {
                  UserID: UserID
                }
              })
            }
            // if (UserProfileImage){
            if (
              file.mimetype == "image/jpeg" ||
              file.mimetype == "image/png" ||
              file.mimetype == "image/gif"
            ) {
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
                "This format is not allowed , please upload file with '.png','.gif','.jpg'";
              await res.redirect("/userprofile");
            }

            const userAddress = await Useraddress.findOne({
              where: {
                UserID: userid,
              },
            });

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

            await res.redirect("/userprofile");
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
