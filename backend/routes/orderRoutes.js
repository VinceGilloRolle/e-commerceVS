const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// POST /api/orders  (customers only)
router.post('/', authenticate, requireRole('customer'), orderController.createOrder);

// POST /api/orders/pos  (store owner in-store checkout)
router.post('/pos', authenticate, requireRole('store-owner'), orderController.createPosOrder);

// GET /api/orders  (store owner sees every order)
router.get('/', authenticate, requireRole('store-owner'), orderController.getAllOrders);

// GET /api/orders/user/:id  (customers see their own)
router.get('/user/:id', authenticate, requireRole('customer'), orderController.getUserOrders);

module.exports = router;
