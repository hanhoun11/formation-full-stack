// src/services/orders.service.js
const Order = require('../models/order.model');
const Product = require('../models/product.model');

async function listOrders({ status, page = 1, limit = 10 } = {}) {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Order.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('items.product'), // récupérer les infos produits
    Order.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

async function getOrderById(id) {
  const order = await Order.findById(id).populate('items.product');
  return order;
}

// data : { items: [ { productId, quantity } ] }
async function createOrder(data) {
  // Calculer le total à partir des produits
  const productIds = data.items.map((item) => item.productId);

  const products = await Product.find({ _id: { $in: productIds } });

  const items = data.items.map((item) => {
    const product = products.find((p) => p._id.toString() === item.productId);
    if (!product) {
      throw new Error(`Produit introuvable: ${item.productId}`);
    }
    return {
      product: product._id,
      quantity: item.quantity,
      unitPrice: product.price,
    };
  });

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const order = await Order.create({
    items,
    totalAmount,
    status: 'pending',
  });

  return order;
}

module.exports = {
  listOrders,
  getOrderById,
  createOrder,
};