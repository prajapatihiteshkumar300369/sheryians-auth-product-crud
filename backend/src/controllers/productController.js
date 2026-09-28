const Product = require("../models/Product");

const ALLOWED_FIELDS = [
  "name",
  "description",
  "price",
  "category",
  "stock",
  "image"
];

function pickProductFields(body) {
  return Object.fromEntries(
    ALLOWED_FIELDS.filter((key) => body[key] !== undefined).map((key) => [
      key,
      body[key]
    ])
  );
}

async function createProduct(req, res) {
  const product = await Product.create(pickProductFields(req.body));

  return res.status(201).json({
    message: "Product created successfully",
    product
  });
}

async function getProducts(req, res) {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments()
  ]);

  return res.json({
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}

async function getProductById(req, res) {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({ product });
}

async function updateProduct(req, res) {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    pickProductFields(req.body),
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({
    message: "Product updated successfully",
    product
  });
}

async function deleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({ message: "Product deleted successfully" });
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
