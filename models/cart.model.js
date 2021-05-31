const Sequelize = require("sequelize");
const {sequelize} = require("./db");
const {User} = require("./user.model");
const {Product} = require("./product.model");

const Cart = sequelize.define(
    "cart",
    {
      CartID: {
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
      Total: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
    }
  );

  User.hasMany(Cart, {
    foreignKey: "UserID",
    onDelete: "CASCADE",
  });
  Cart.belongsTo(User, { foreignKey: "UserID", onDelete: "CASCADE" });

  Product.hasMany(Cart, {
    foreignKey: "ProductID",
    onDelete: "CASCADE",
  });
  Cart.belongsTo(Product, { foreignKey: "ProductID", onDelete: "CASCADE" });

  module.exports = {Cart};