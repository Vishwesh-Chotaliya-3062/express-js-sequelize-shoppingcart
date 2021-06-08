var {check,validationResult} = require('express-validator');

exports.getValidate = async (req, res, next) => {

    check('UserName').isLength(5).withMessage("Enter User Name").isAlpha().withMessage("User Name should only have alphabets"),
    check('Email').isEmail().withMessage("Enter valid Email")
}