var express = require("express");
var app = express();
const { sequelize } = require("../models/db");
const { User } = require("../models/user.model");
const { Product } = require("../models/product.model");
const { Wallet } = require("../models/wallet.model");
const { Cart } = require("../models/cart.model");
const { Salesorder } = require("../models/salesorder.model");
const { Failedorder } = require("../models/failedorder.model");
const { Couponcode } = require("../models/couponcode.model");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");

var cookieParser = require("cookie-parser");
app.use(cookieParser());

exports.getSuccess = async (req, res, next) => {
    try {
        const salesorderID = await Salesorder.findOne({
        order: [['SalesorderID', 'DESC']],
        limit: 1,
      })
  
      const SalesorderID = salesorderID.dataValues.SalesorderID;
      console.log("Last Order ID:", SalesorderID);
  
      const Items = salesorderID.dataValues.Items;
      console.log("Items:", Items)
  
      const Item1 = Items.substring(0, Items.indexOf(","))
      console.log(Item1);
  
      const Item2 = Items.substring(Items.indexOf(",") + 1, Items.lastIndexOf(","))
      console.log(Item2);
  
      const Item3 = Items.substring(Items.lastIndexOf(",") + 1)
      console.log(Item3);
  
      let allItems = [Item1, Item2, Item3];
      
      const productList = await Product.findAll({
        attributes: [
          [
            db.sequelize.fn("GROUP_CONCAT", " ", db.sequelize.col("ProductID")),
            "ProductID",
          ],
          [
            db.sequelize.fn("GROUP_CONCAT" , " ",  db.sequelize.col("ProductName")),
            "ProductName",
          ],
        ],
        where: {
          ProductName : allItems
        },
      });
  
      const salesorderList = await Salesorder.findAll({
        where: {
          SalesorderID : SalesorderID
        },
      });
  
      res.render("success", {
        productList: productList,
        salesorderList: salesorderList
      });
  
    } catch (error) {
      return res.status(500).json(500, false, error.message);
    }
};

exports.confirmOrder = async (req, res, next) => {
    const ProductID = req.params.productid;
    const UserID = req.cookies.userid;
    console.log("Delete:", ProductID, UserID);
  
    try {
      await sequelize.query("CALL DeleteCart( :UserID, :ProductID)", {
        replacements: { UserID, ProductID },
        logging: false,
      });
      return res.redirect("/cart");
    } catch (e) {
      console.log(e);
      return res.send(500).send("Something went wrong!");
    }
  };