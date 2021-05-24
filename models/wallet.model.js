const db = require("../models");
const User = db.user;

module.exports = (sequelize, Sequelize) => {
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
          type: Sequelize.DECIMAL(20,2),
          allowNull: false,
          defaultValue: 0
        },
      },
      {
        freezeTableName: true,
        paranoid: true
      }
    );

    return Wallet;
  };
  