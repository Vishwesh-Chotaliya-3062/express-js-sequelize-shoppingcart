const Sequelize = require("sequelize");
const {sequelize} = require("./db");
const { NOW } = require("sequelize");
const { User } = require("./user.model");

const Couponcode = sequelize.define(
    "couponcode",
    {
      CouponcodeID: {
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
      CouponCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Details: {
        type: Sequelize.STRING,
        allowNull:false
      },
      Status: {
        type: Sequelize.ENUM("unused", "used"),
        allowNull: false,
        defaultValue: "unused"
      },
      ExpiryDate: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: NOW()
      }
    },
    {
      freezeTableName: true,
    }
  );

  User.hasMany(Couponcode, {
    foreignKey: "UserID",
    onDelete: "CASCADE",
  });
  Couponcode.belongsTo(User, { foreignKey: "UserID", onDelete: "CASCADE" });

  module.exports = {Couponcode};