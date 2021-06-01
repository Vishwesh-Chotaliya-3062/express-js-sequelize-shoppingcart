const Sequelize = require("sequelize");
const {sequelize} = require("./db");

const Couponcode = sequelize.define(
    "couponcode",
    {
      CouponcodeID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      Email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      CouponCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Details: {
        type: Sequelize.STRING,
        allowNull:false
      }
    },
    {
      freezeTableName: true,
    }
  );

  module.exports = {Couponcode};