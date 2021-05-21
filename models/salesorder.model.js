module.exports = (sequelize, Sequelize) => {
  const Salesorder = sequelize.define(
    "salesorder",
    {
      SalesorderID: {
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
      ProductName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      SKU: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      Total: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      OrderedQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
    }
  );

  // sequelize.query("delete from salesorder");
  // sequelize.query("ALTER TABLE salesorder AUTO_INCREMENT = 1");

  return Salesorder;
};