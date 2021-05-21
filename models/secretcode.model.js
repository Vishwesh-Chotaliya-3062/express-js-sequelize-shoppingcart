module.exports = (sequelize, Sequelize) => {
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
      DateCreated: {
        type: Sequelize.DATE,
        default: Date.now(),
        expires: 600,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );

  return Secretcode;
};
