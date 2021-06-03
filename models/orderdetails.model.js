const Sequelize = require("sequelize");
const {sequelize} = require("./db");
const {User} = require("./user.model");
const {Product} = require("./product.model");

const Orderdetails = sequelize.define(
    "orderdetails",
    {
      OrderdetailsID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      UserID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "UserID",
        },
      },
      ProductID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "product",
          key: "ProductID",
        },
      },
      Quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        default: 0,
      },
      SubTotal: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
      },
      DiscountPrice: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
        default: 0
      },
      Total: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
    }
  );

  User.hasMany(Orderdetails, {
    foreignKey: "UserID",
    onDelete: "CASCADE",
  });
  Orderdetails.belongsTo(User, { foreignKey: "UserID", onDelete: "CASCADE" });

  Product.hasMany(Orderdetails, {
    foreignKey: "ProductID",
    onDelete: "CASCADE",
  });
  Orderdetails.belongsTo(Product, { foreignKey: "ProductID", onDelete: "CASCADE" });

  module.exports = {Orderdetails};