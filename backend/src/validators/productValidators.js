const { body, param, query } = require("express-validator");

const productBody = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 150 })
    .withMessage("Product name cannot exceed 150 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a number greater than or equal to 0")
    .toFloat(),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer")
    .toInt(),
  body("image")
    .optional({ values: "falsy" })
    .trim()
    .isURL()
    .withMessage("Image must be a valid URL")
];

const productIdValidator = [
  param("id").isMongoId().withMessage("Invalid product ID")
];

const listValidator = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt()
];

module.exports = { productBody, productIdValidator, listValidator };
