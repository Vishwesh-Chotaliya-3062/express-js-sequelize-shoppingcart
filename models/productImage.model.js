const Sequelize = require("sequelize");
const { sequelize } = require("./db");
const { Product } = require("./product.model");

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
          model: "product",
          key: "ProductID",
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

Product.hasOne(ProductImage, {
  foreignKey: "ProductID",
  onDelete: "CASCADE",
});
ProductImage.belongsTo(Product, { foreignKey: "ProductID", onDelete: "CASCADE" });

module.exports = { ProductImage };