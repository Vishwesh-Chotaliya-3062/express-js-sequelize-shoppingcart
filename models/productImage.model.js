const Sequelize = require("sequelize");
const { sequelize } = require("./db");

const ProductImage = sequelize.define(
  "productimage",
  {
    ProductImageID: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    ProductID: {
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

module.exports = { ProductImage };
