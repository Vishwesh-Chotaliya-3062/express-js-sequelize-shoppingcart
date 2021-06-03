const Sequelize = require("sequelize");
const {sequelize} = require("./db")

const Product = sequelize.define(
    "product",
    {
      ProductID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      ProductName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      SKU: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      Price: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
      },
      QuantityLeft: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      CompanyName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Category: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      SubCategory: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
    }
  );

  module.exports = {Product};