const express = require("express");
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");
const {
  productBody,
  productIdValidator,
  listValidator
} = require("../validators/productValidators");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const router = express.Router();

router.post("/", authenticate, productBody, validate, createProduct);
router.get("/", listValidator, validate, getProducts);
router.get("/:id", productIdValidator, validate, getProductById);
router.put(
  "/:id",
  authenticate,
  productIdValidator,
  productBody,
  validate,
  updateProduct
);
router.delete("/:id", authenticate, productIdValidator, validate, deleteProduct);

module.exports = router;
