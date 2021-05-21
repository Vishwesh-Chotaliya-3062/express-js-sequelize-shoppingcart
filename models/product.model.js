module.exports = (sequelize, Sequelize) => {
  var Product = sequelize.define(
    "product",
    {
      ProductID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      ProductName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      SKU: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      Price: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      QuantityLeft: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },

    {
      freezeTableName: true,
    }
  );

  return Product;
};