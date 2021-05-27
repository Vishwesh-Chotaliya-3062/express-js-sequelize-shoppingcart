const Sequelize = require("sequelize");
const {sequelize} = require("./db");

const Secretcode = sequelize.define(
    "secretcode",
    {
      SecretcodeID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      Email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      Code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
    }
  );

  module.exports = {Secretcode};