const Sequelize = require("sequelize");
const {sequelize} = require("./db");
const {User} = require("./user.model");
const {Product} = require("./product.model");

const Salesorder = sequelize.define(
    "salesorder",
    {
      SalesorderID: {
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
      ProductName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      SKU: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      Total: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
      },
      OrderedQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
    }
  );

  User.hasMany(Salesorder, {
    foreignKey: "UserID",
    onDelete: "CASCADE",
  });
  Salesorder.belongsTo(User, { foreignKey: "UserID", onDelete: "CASCADE" });

  Product.hasMany(Salesorder, {
    foreignKey: "ProductID",
    onDelete: "CASCADE",
  });
  Salesorder.belongsTo(Product, { foreignKey: "ProductID", onDelete: "CASCADE" });

  // sequelize.query("delete from salesorder");
  // sequelize.query("ALTER TABLE salesorder AUTO_INCREMENT = 1");

  module.exports = {Salesorder};
