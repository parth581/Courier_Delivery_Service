const Courier = require('../models/Courier');

/**
 * Create a new courier
 * POST /couriers
 */
async function createCourier(req, res) {
  try {
    const { name, location } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid name. Must be a non-empty string'
      });
    }

    if (!location || typeof location.x !== 'number' || typeof location.y !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid location. Must have x and y coordinates (numbers)'
      });
    }

    const courier = new Courier({
      name: name.trim(),
      location,
      isAvailable: true,
      activeOrderId: null
    });

    await courier.save();

    res.status(201).json({
      success: true,
      message: 'Courier created successfully',
      courier
    });

  } catch (error) {
    console.error('Error creating courier:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * Get all couriers
 * GET /couriers
 */
async function getAllCouriers(req, res) {
  try {
    const { available } = req.query;
    
    const filter = {};
    if (available === 'true') {
      filter.isAvailable = true;
    } else if (available === 'false') {
      filter.isAvailable = false;
    }

    const couriers = await Courier.find(filter)
      .populate('activeOrderId', 'status deliveryType pickupLocation dropLocation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: couriers.length,
      couriers
    });

  } catch (error) {
    console.error('Error fetching couriers:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * Get courier by ID
 * GET /couriers/:id
 */
async function getCourier(req, res) {
  try {
    const { id } = req.params;

    const courier = await Courier.findById(id)
      .populate('activeOrderId', 'status deliveryType pickupLocation dropLocation');

    if (!courier) {
      return res.status(404).json({
        success: false,
        error: 'Courier not found'
      });
    }

    res.status(200).json({
      success: true,
      courier
    });

  } catch (error) {
    console.error('Error fetching courier:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * Update courier location
 * PATCH /couriers/:id/location
 */
async function updateCourierLocation(req, res) {
  try {
    const { id } = req.params;
    const { location } = req.body;

    if (!location || typeof location.x !== 'number' || typeof location.y !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid location. Must have x and y coordinates (numbers)'
      });
    }

    const courier = await Courier.findByIdAndUpdate(
      id,
      { $set: { location } },
      { new: true }
    ).populate('activeOrderId', 'status deliveryType pickupLocation dropLocation');

    if (!courier) {
      return res.status(404).json({
        success: false,
        error: 'Courier not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Courier location updated',
      courier
    });

  } catch (error) {
    console.error('Error updating courier location:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  createCourier,
  getAllCouriers,
  getCourier,
  updateCourierLocation
};
