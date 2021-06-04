const Sequelize = require("sequelize");
const {sequelize} = require("./db");
const {User} = require("./user.model");

  const Wallet = sequelize.define(
    "wallet",
    {
      WalletID: {
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
      Balance: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min:0,
        }
      },
    },
    {
      freezeTableName: true,
      paranoid: true,
    }
  );

  User.hasOne(Wallet, {
    foreignKey: "UserID",
    onDelete: "CASCADE",
  });
  Wallet.belongsTo(User, { foreignKey: "UserID", onDelete: "CASCADE" });

  module.exports = {Wallet};