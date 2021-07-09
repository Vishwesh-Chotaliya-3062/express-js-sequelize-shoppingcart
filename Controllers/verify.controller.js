const { sequelize } = require("../models/db");
const { User } = require("../models/user.model");
const { Wallet } = require("../models/wallet.model");
const { Secretcode } = require("../models/secretcode.model");
const { Couponcode } = require("../models/couponcode.model");
const { sendGifts } = require("../helper/mailer.helper");
const { dateAfterWeeks } = require("../helper/autoDate.helper");

var otpGenerator = require("crypto-random-string");

let couponcode = otpGenerator(15, {});

let details = "FLAT 50% OFF";

exports.getVerify = async (req, res, next) => {
  try {
    const UserID = req.params.UserID;
    const title = "Verify Account";
    res.render("verify", { title, UserID });
  } catch (error) {
    return res.status(500).json(500, false, error.message);
  }
};

exports.postVerify = async function (req, res, next) {
  const { UserID, secretcode } = req.body;
  if (!secretcode) {
    res.status(400).redirect("verify/" + UserID);
  }
  const verifyTransaction = await sequelize.transaction();
  try {
    const user = await User.findOne({ where: { UserID }, include: Wallet });
    const verified = await Secretcode.findOne({
      where: { Email: user.Email, Code: secretcode },
    });
    if (verified) {
      user.Status = "active";
      user.wallet.Balance = process.env.GIFT_AMOUNT || 500; 
      console.log(user.UserID);
      await Couponcode.create({
        UserID: user.UserID,
        CouponCode: couponcode,
        Details: details,
        ExpiryDate: dateAfterWeeks(2),
      });

      await user.wallet.save({ transaction: verifyTransaction });
      await user.save({ transaction: verifyTransaction });
      await Secretcode.destroy({
        where: { Email: user.Email },
        transaction: verifyTransaction,
      });

      sendGifts({ UserName: user.UserName, Email: user.Email }, couponcode);

      await verifyTransaction.commit();
      return res.redirect("login");
    }
    res.status(400).redirect("verify/" + UserID);
  } catch (err) {
    console.log(err.message);
    await verifyTransaction.rollback();
    res.status(500).redirect("verify/" + UserID);
  }
};
