const Sequelize = require("sequelize");
const { sequelize } = require("./db");
const { User } = require("./user.model");

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

User.hasOne(ProfileImage, {
  foreignKey: "UserID",
  onDelete: "CASCADE",
});
ProfileImage.belongsTo(User, { foreignKey: "UserID", onDelete: "CASCADE" });

module.exports = { ProfileImage };
