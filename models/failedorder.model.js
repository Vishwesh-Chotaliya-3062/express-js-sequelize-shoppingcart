const Sequelize = require("sequelize");
const {sequelize} = require("./db");
const {User} = require("./user.model");
const {Product} = require("./product.model");

const Failedorder = sequelize.define(
    "failedorder",
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
      OrderedQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      Status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "failed"
      }
    },
    {
      freezeTableName: true,
    }
  );

  User.hasMany(Failedorder, {
    foreignKey: "UserID",
    onDelete: "CASCADE",
  });
  Failedorder.belongsTo(User, { foreignKey: "UserID", onDelete: "CASCADE" });

  Product.hasMany(Failedorder, {
    foreignKey: "ProductID",
    onDelete: "CASCADE",
  });
  Failedorder.belongsTo(Product, { foreignKey: "ProductID", onDelete: "CASCADE" });

  // sequelize.query("delete from salesorder");
  // sequelize.query("ALTER TABLE salesorder AUTO_INCREMENT = 1");

  module.exports = {Failedorder};
