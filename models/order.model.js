const Sequelize = require("sequelize");
const { sequelize } = require("./db");
const { User } = require("./user.model");
const { Couponcode } = require("./couponcode.model");
const { Product } = require("./product.model");

const Order = sequelize.define(
  "order",
  {
    TotalAmount: {
      type: Sequelize.DECIMAL(20, 2),
      allowNull: false,
      defaultValue: 0,
    },
    DiscountedAmount: {
      type: Sequelize.DECIMAL(20, 2),
      allowNull: false,
      defaultValue: 0,
    },
    PurchaseTotal: {
      type: Sequelize.DECIMAL(20, 2),
      allowNull: false,
      defaultValue: 0,
    },
    Status: {
      type: Sequelize.ENUM("pending", "success", "failed"),
      allowNull: false,
      defaultValue: "pending",
    },
    Remark: {
      type: Sequelize.STRING(64),
      allowNull: true,
      defaultValue: "Payment pending",
    },
    Coupon: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "No Coupon Applied",
    },
  },
  {
    timestamps: true,
    createdAt: false,
    updatedAt: "Date",
    freezeTableName: true,
  }
);

User.hasMany(Order, {
  onDelete: "CASCADE",
  allowNull: false,
});
Order.belongsTo(User);

Couponcode.hasOne(Order, {
  onDelete: "SET NULL",
});
Order.belongsTo(Couponcode);

const OrderDetail = sequelize.define(
  "orderdetail",
  {
    Quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: true,
      },
    },
    Total: {
      type: Sequelize.DECIMAL(20, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

Order.hasMany(OrderDetail, {
  onDelete: "CASCADE",
  allowNull: false,
});
OrderDetail.belongsTo(Order);

Product.hasMany(OrderDetail, {
  onDelete: "CASCADE",
  allowNull: false,
});
OrderDetail.belongsTo(Product);

module.exports = { Order, OrderDetail };
