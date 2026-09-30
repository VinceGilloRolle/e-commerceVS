const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

const ownerOnly = [authenticate, requireRole('store-owner')];

// GET /api/products
router.get('/', productController.getAllProducts);

// GET /api/products/:id
router.get('/:id', productController.getProductById);

// Store owner catalog management
router.post('/', ownerOnly, productController.createProduct);
router.put('/:id', ownerOnly, productController.updateProduct);
router.delete('/:id', ownerOnly, productController.deleteProduct);

module.exports = router;
