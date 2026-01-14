const express = require('express');
const router = express.Router();
const {
  createCourier,
  getAllCouriers,
  getCourier,
  updateCourierLocation
} = require('../controllers/courierController');

// POST /couriers - Create courier
router.post('/', createCourier);

// GET /couriers - Get all couriers
router.get('/', getAllCouriers);

// GET /couriers/:id - Get courier by ID
router.get('/:id', getCourier);

// PATCH /couriers/:id/location - Update courier location
router.patch('/:id/location', updateCourierLocation);

module.exports = router;
