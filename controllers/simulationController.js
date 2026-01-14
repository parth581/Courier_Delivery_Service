const Courier = require('../models/Courier');
const Order = require('../models/Order');
const { calculateManhattanDistance } = require('../utils/distance');
const { autoProgressState } = require('../services/stateService');

/**
 * Simulate courier movement
 * POST /simulate/move
 * 
 * Moves courier one unit towards their current target (pickup or drop location)
 */
async function simulateCourierMovement(req, res) {
  try {
    const { courierId } = req.body;

    if (!courierId) {
      return res.status(400).json({
        success: false,
        error: 'courierId is required'
      });
    }

    const courier = await Courier.findById(courierId);
    if (!courier) {
      return res.status(404).json({
        success: false,
        error: 'Courier not found'
      });
    }

    // Check if courier has an active order
    if (!courier.activeOrderId) {
      return res.status(400).json({
        success: false,
        error: 'Courier has no active order to move towards'
      });
    }

    const order = await Order.findById(courier.activeOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Active order not found'
      });
    }

    // Determine target location based on order status
    let targetLocation;
    if (order.status === 'ASSIGNED') {
      targetLocation = order.pickupLocation;
    } else if (order.status === 'PICKED_UP' || order.status === 'IN_TRANSIT') {
      targetLocation = order.dropLocation;
    } else {
      return res.status(400).json({
        success: false,
        error: `Cannot move courier. Order status is ${order.status}`
      });
    }

    // Calculate direction and move one unit
    const currentLocation = courier.location;
    const dx = targetLocation.x - currentLocation.x;
    const dy = targetLocation.y - currentLocation.y;

    // Move one unit in the direction of target
    // If already at target, don't move
    if (Math.abs(dx) + Math.abs(dy) === 0) {
      // Already at target, check for state progression
      const progression = await autoProgressState(order, courier);
      const updatedCourier = await Courier.findById(courierId)
        .populate('activeOrderId', 'status deliveryType pickupLocation dropLocation');
      const updatedOrder = await Order.findById(order._id);

      return res.status(200).json({
        success: true,
        message: 'Courier already at target location',
        courier: updatedCourier,
        order: updatedOrder,
        stateProgression: progression
      });
    }

    // Move one unit (Manhattan distance)
    let newX = currentLocation.x;
    let newY = currentLocation.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Move horizontally first
      newX += dx > 0 ? 1 : -1;
    } else if (dy !== 0) {
      // Move vertically
      newY += dy > 0 ? 1 : -1;
    } else {
      // Move horizontally if dy is 0
      newX += dx > 0 ? 1 : -1;
    }

    // Update courier location
    courier.location = { x: newX, y: newY };
    await courier.save();

    // Check for automatic state progression
    const progression = await autoProgressState(order, courier);

    // Refresh data
    const updatedCourier = await Courier.findById(courierId)
      .populate('activeOrderId', 'status deliveryType pickupLocation dropLocation');
    const updatedOrder = await Order.findById(order._id);

    const distanceToTarget = calculateManhattanDistance(
      updatedCourier.location,
      targetLocation
    );

    res.status(200).json({
      success: true,
      message: 'Courier moved successfully',
      courier: updatedCourier,
      order: updatedOrder,
      distanceToTarget,
      stateProgression: progression
    });

  } catch (error) {
    console.error('Error simulating courier movement:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  simulateCourierMovement
};
