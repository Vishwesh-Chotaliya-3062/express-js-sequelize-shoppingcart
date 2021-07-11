const { Useraddress } = require("../models/useraddress.model");

exports.getUserAddress = async (req, res, next) => {
  try {
    const body = req.body;
    const City = body.City;
    const Zipcode = body.Zipcode;
    const Address = body.Address;
    const State = body.State;
    const Country = body.Country;
    const UserID = req.params.userid;
    const useraddress = { UserID, City, Zipcode, Address, State, Country };

    const alreadyAddress = await Useraddress.findOne({
      where: {
        UserID: UserID,
      },
    });

    if (!alreadyAddress) {
      await Useraddress.create(useraddress);
    } else {
      await Useraddress.destroy({
        where: {
          UserID: UserID,
        },
      });

      await Useraddress.create(useraddress);
    }
    return res.redirect("/orderdetails");
  } catch (e) {
    return res.send(500).send("Something went wrong!");
  }
};
