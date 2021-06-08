const Sequelize = require("sequelize");
const { sequelize } = require("./db");
const { User } = require("./user.model");

const Useraddress = sequelize.define(
  "useraddress",
  {
    UseraddressID: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    UserID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "user",
        key: "UserID",
      },
    },
    City: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    Zipcode: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    Address: {
      type: Sequelize.STRING(1000),
      allowNull: false,
    },
    State: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    Country: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

User.hasMany(Useraddress, {
  foreignKey: "UserID",
  onDelete: "CASCADE",
});
Useraddress.belongsTo(User, { foreignKey: "UserID", onDelete: "CASCADE" });

module.exports = { Useraddress };
