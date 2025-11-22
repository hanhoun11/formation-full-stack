const Product = require('../models/product.model');

async function listProducts({ category, inStock, page = 1, limit = 10 } = {}) {
  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (inStock !== undefined) {
    filter.inStock = inStock;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Product.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

async function getProductById(id) {
  const product = await Product.findById(id);
  return product; // peut être null si non trouvé
}

async function createProduct(data) {
  const product = await Product.create(data);
  return product;
}

async function updateProduct(id, data) {
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true, // retourner le document mis à jour
    runValidators: true, // appliquer les validations du schéma
  });
  return product;
}

async function deleteProduct(id) {
  const product = await Product.findByIdAndDelete(id);
  return product;
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};