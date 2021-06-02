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
            where : {
                UserID : UserID
            }
        })

        if(!alreadyAddress){
            Useraddress.create(useraddress);
        }
        else {
            Useraddress.destroy({
                where : {
                    UserID : UserID
                }
            })

            Useraddress.create(useraddress);
        }
        console.log("user address", useraddress);
        return res.redirect("/orderdetails");
  
    } catch (e) {
      console.log(e);
      return res.send(500).send("Something went wrong!");
    }
};