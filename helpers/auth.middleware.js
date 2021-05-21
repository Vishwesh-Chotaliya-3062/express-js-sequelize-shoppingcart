'use strict';

const { sign, verify } = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.JWT_SECRET;
const createError = require('http-errors');

exports.getAuthentication = async (req, res, next) => {
    try {
      await res.render("login");
    } catch (error) {
      return res.status(500).json(500, false, error.message);
    }
  };

// Authorization Middleware
exports.authorise = async (req, res, next) => {
    const payload = req.userData;

    if (!payload) {
        next(createError(400, "Invalid Request"));
    } else {
        try {
            const token = sign(payload, SECRET, { expiresIn: 1 * 60 * 60 * 1000 });
            res
                .status(200)
                .send({
                    Message: "Ok! Successfully Signed In!",
                    Token: token
                });
        } catch(err) {
            console.log("Error occured while Authorization: ", err.message);
            next(createError('Something went wrong!'));
        }
    }
}

// Authentication Middleware
exports.authenticate = async (req, res, next) => {
    const authToken = req.headers["authorization"];

    if (!authToken) {
        next(createError(401, "Unauthorized!"));
    } else {
        try {
            console.log(SECRET);
            const token = authToken.split(' ')[1];
            verify(token, SECRET, (err, data) => {
                if (err) {
                    next(createError(401, "Unauthorized!"));
                } else {
                    req.userData = {
                        name: data.name,
                        email: data.email
                    }
                    next();
                }
            });
        } catch(err) {
            console.log("Error occured while Aunthenticattion: ", err.message);
            next(createError('Something went wrong!'));
        }
    }
}