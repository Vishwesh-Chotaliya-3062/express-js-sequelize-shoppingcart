const db = require("../models");
const User = db.user;
const jwt_decode = require("jwt-decode");
const jwt = require('jsonwebtoken');
var express = require("express");
var app = express();
var cookieParser = require("cookie-parser");
app.use(cookieParser());

exports.userAuthorization = async (req, res, next) => {
  try {
       const token = req.cookies.token;
    
    //   console.log("At top", token);

    if (!token) {
      res.json({
        error: "Unauthorized"
      });
    } else {
      try {
        console.log("Authentication Token:",token);
        
        jwt.verify(token, "thisismysecret", async (err, data) => {
          if (err) {
            res.json({
              error: "Unauthorized"
            });
          } else {
            console.log("Verified");
            var decoded = jwt_decode(token);
            console.log(decoded);
            var username = decoded.name;
            console.log("user",username)

            const userDetails = await User.findAll({
              attributes: ["UserID", "UserName", "Status"],
              where: {
                UserName: username,
              }
            });
            
            res.clearCookie('token');

            res.render("welcome", {
              userDetails: userDetails
            });
          }
        });
      } catch (err) {
        console.log("Error occured while Aunthenticattion: ", err.message);
        res.json({
          error: "Error occured while Aunthenticattion: "
        });
      }
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
