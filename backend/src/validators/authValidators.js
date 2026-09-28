const { body } = require("express-validator");

const emailRule = body("email")
  .trim()
  .isEmail()
  .withMessage("A valid email is required")
  .normalizeEmail({ gmail_remove_dots: false });

const passwordRule = body("password")
  .isString()
  .isLength({ min: 6 })
  .withMessage("Password must be at least 6 characters");

const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be 2-80 characters"),
  emailRule,
  passwordRule,
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match")
];

const loginValidator = [emailRule, passwordRule];

module.exports = { registerValidator, loginValidator };
