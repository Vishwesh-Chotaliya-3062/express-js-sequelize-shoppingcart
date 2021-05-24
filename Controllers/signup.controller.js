const db = require("../models");
const User = db.user;
const Secretcode = db.secretcode;
const Wallet = db.wallet;
const Op = db.Sequelize.Op;
const bcrypt = require("bcryptjs");
const saltRounds = 10;
var otpGenerator = require("otp-generator");
const { sendVerifyEmail } = require("../helper/mailer.helper");

let secretcode = otpGenerator.generate(6, {
  upperCase: true,
  specialChars: false,
});

exports.getUser = async (req, res, next) => {
  try {
    res.render("signup");
  } catch (error) {
    return res.status(500).json(500, false, error.message);
  }
};

// Create and Save a new User
exports.create = (req, res) => {

  User.hasOne(Wallet, {
    foreignKey: "UserID",
    onDelete: "CASCADE",
  });
  Wallet.belongsTo(User, { foreignKey: "UserID" });

  // Create a User
  const user = {
    UserName: req.body.UserName,
    Email: req.body.Email,
    Password: req.body.Password,
    Status: req.body.Status,
    wallet: {},
  };

  User.findOne({
    where: {
      UserName: user.UserName,
    },
  })
    .then((data) => {
      if (!data) {
        User.findOne({
          where: {
            Email: user.Email,
          },
        })
          .then((data) => {
            if (!data) {
              bcrypt.genSalt(saltRounds, function (err, salt) {
                if (err) {
                  throw err;
                } else {
                  bcrypt.hash(req.body.Password, salt, function (err, hash) {
                    if (err) {
                      throw err;
                    } else {
                      user.Password = hash;
                      User.create(user, { include: { model: Wallet } })
                        .then((data) => {
                          // res.json({
                          //   UserID: data.UserID,
                          //   UserName: data.UserName,
                          //   Email: data.Email,
                          //   Status: data.Status,
                          // });

                          Secretcode.create({
                            Email: req.body.Email,
                            Code: secretcode,
                          });
                          sendVerifyEmail(
                            { UserName: data.UserName, Email: data.Email },
                            secretcode
                          );
                          res.redirect("verify/" + data.UserID);
                        })
                        .catch((err) => {
                          // res.json({
                          //   error: err.message,
                          // });
                          res.redirect("signup");
                        });
                    }
                  });
                }
              });
            } else {
              res.json({
                error: "USER WITH Email = " + user.Email + " ALREADY EXISTS",
              });
            }
          })
          .catch((err) => {
            res.json({
              error: err.message,
            });
          });
      } else {
        res.json({
          error: "USER WITH UserName = " + user.UserName + " ALREADY EXISTS",
        });
      }
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
    });
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  const UserName = req.query.UserName;
  var condition = UserName
    ? {
        UserName: {
          [Op.like]: `%${UserName}%`,
        },
      }
    : null;

  User.findAll({
    where: condition,
    attributes: ["UserID", "UserName", "Email", "Status"],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Users.",
      });
    });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findByPk(id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving User with id=" + id,
      });
    });
};

// Update a User by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  User.update(req.body, {
    where: {
      UserID: id,
    },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "User was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty! or Maybe no change in data`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating User with id=" + id,
      });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.destroy({
    where: {
      UserID: id,
    },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "User with id=" + id + " was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete User with id=" + id,
      });
    });
};

// Delete all Users from the database.
exports.deleteAll = (req, res) => {
  User.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} User were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all users.",
      });
    });
};

// find all published Users
exports.findAllPublished = (req, res) => {
  User.findAll({
    where: {
      Status: true,
    },
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};
