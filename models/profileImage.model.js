const Sequelize = require("sequelize");
const { sequelize } = require("./db");

const ProfileImage = sequelize.define(
  "profileimage",
  {
    ProfileImageID: {
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
    Image: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = { ProfileImage };
