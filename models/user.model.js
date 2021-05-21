module.exports = (sequelize, Sequelize) => {
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
        validate: {
          isEmail: true,
        },
      },
      Password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Status: {
        type: Sequelize.STRING,
        default: "pending",
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  return User;
};
