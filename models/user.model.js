const Sequelize = require("sequelize");
const { sequelize } = require("./db");

const User = sequelize.define(
  "user",
  {
    UserID: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    UserName: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    Email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    Password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    Status: {
      type: Sequelize.STRING,
    },
    Token: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    paranoid: true,
  }
);

module.exports = { User };
