const {Cart}= require("../models/cart.model");
const {sequelize} = require("../models/db");

module.exports = (app) => {
  const cart = require("../Controllers/cart.controller");

  var router = require("express").Router();

  router.get("/cart", cart.getCart);
  
  router.post("/cart/added/:productid", cart.addToCart);

  router.post("/cart/updated/:productid", cart.updateCart);

    // const productid = req.params.productid;
    // console.log(productid);
    // const userid = req.cookies.userid;

  //   const already = await Cart.findOne({
  //     where: {
  //       UserID : userid,
  //       ProductID : productid
  //     }
  //   })

  //   console.log(already);

  //   const cart1 = {
  //     UserID: userid,
  //     ProductID: productid,
  //     Quantity : 1,
  //     Total : 100
  //   };

  //   if(already)
  //   {
  //     await sequelize.query(`UPDATE cart INNER JOIN product on product.ProductID = cart.ProductID SET cart.Quantity = cart.Quantity + 1 where cart.UserID = ${userid} AND cart.ProductID = ${productid};`);
  //     await sequelize.query(`UPDATE cart INNER JOIN product on product.ProductID = cart.ProductID SET cart.Total = product.Price * cart.Quantity where cart.UserID = ${userid} AND cart.ProductID = ${productid};`);
  //     res.json("Updated");
      
  //   }

  //   else{
  //     await Cart.create(cart1);
  //     res.json("Added");
      
  //   }

  // });

  app.use("/", router);
};