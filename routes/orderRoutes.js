const express = require('express');
const router = express.Router();
const {
  createOrder,
  cancelOrder,
  getOrder,
  getAllOrders
} = require('../controllers/orderController');

// POST /orders - Create order
router.post('/', createOrder);

// GET /orders - Get all orders
router.get('/', getAllOrders);

// GET /orders/:id - Get order by ID
router.get('/:id', getOrder);

// POST /orders/:id/cancel - Cancel order
router.post('/:id/cancel', cancelOrder);

module.exports = router;
