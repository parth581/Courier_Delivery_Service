const express = require('express');
const router = express.Router();
const { simulateCourierMovement } = require('../controllers/simulationController');

// POST /simulate/move - Simulate courier movement
router.post('/move', simulateCourierMovement);

module.exports = router;
