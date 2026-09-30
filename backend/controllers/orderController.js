const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { items, total } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item.' });
    }

    if (!total || total <= 0) {
      return res.status(400).json({ message: 'Invalid order total.' });
    }

    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.price) {
        return res.status(400).json({
          message: 'Each item needs product_id, quantity, and price.',
        });
      }
    }

    const order = await orderModel.create(userId, total, items, 'online');

    res.status(201).json({
      message: 'Order placed successfully.',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error creating order.' });
  }
};

// POST /api/orders/pos  (store owner in-store sale)
const createPosOrder = async (req, res) => {
  try {
    const { items, customer_id: customerId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Sale must have at least one item.' });
    }

    let userId;
    if (customerId) {
      const customer = await userModel.findById(customerId);
      if (!customer || customer.role !== 'customer') {
        return res.status(400).json({ message: 'Selected customer was not found.' });
      }
      userId = customer.id;
    } else {
      const walkIn = await userModel.ensureWalkInCustomer();
      userId = walkIn.id;
    }

    const order = await orderModel.createPos(userId, items);

    res.status(201).json({
      message: 'POS sale completed.',
      order,
    });
  } catch (error) {
    console.error('Create POS order error:', error);
    const status = error.status || 500;
    res.status(status).json({
      message: error.status
        ? error.message
        : 'Server error completing POS sale.',
    });
  }
};

// GET /api/orders/user/:id
const getUserOrders = async (req, res) => {
  try {
    const requestedId = parseInt(req.params.id, 10);

    if (req.user.id !== requestedId) {
      return res.status(403).json({ message: 'You can only view your own orders.' });
    }

    const orders = await orderModel.getByUserId(requestedId);
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
};

// GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel.getAll();
    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
};

module.exports = { createOrder, createPosOrder, getUserOrders, getAllOrders };
