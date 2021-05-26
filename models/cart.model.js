module.exports = (sequelize, Sequelize) => {
  const Cart = sequelize.define(
    "cart",
    {
      CartID: {
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
      ProductID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "product",
          key: "ProductID",
        },
      },
      Quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        default: 0,
      }
    },
    {
      freezeTableName: true,
    }
  );

  return Cart;
};
