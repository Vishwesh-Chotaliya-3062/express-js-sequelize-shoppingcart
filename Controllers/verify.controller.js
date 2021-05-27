const {sequelize} = require("../models/db");
const {User} = require("../models/user.model");
const {Wallet} = require("../models/wallet.model");
const {Secretcode} = require("../models/secretcode.model");

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
  // await res.redirect('login');

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
      user.wallet.Balance = 500;
      await user.wallet.save({ transaction: verifyTransaction });
      await user.save({ transaction: verifyTransaction });
      await Secretcode.destroy({
        where: { Email: user.Email },
        transaction: verifyTransaction,
      });
      await verifyTransaction.commit();
      return res.redirect("login");
    }
    res.status(400).redirect("verify/" + UserID);
  } catch (err) {
    await verifyTransaction.rollback();
    console.log(err.message);
    res.status(500).redirect("verify/" + UserID);
  }
};
