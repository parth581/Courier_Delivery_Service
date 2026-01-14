const Order = require('../models/Order');
const Courier = require('../models/Courier');
const { isWithinThreshold } = require('../utils/distance');

/**
 * Valid state transitions map
 * 
 * IMPORTANT: Cancellation is only allowed from CREATED or ASSIGNED
 * Once package is picked up (PICKED_UP), it cannot be cancelled
 */
const VALID_TRANSITIONS = {
  CREATED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT'], // Cannot cancel after pickup
  IN_TRANSIT: ['DELIVERED'], // Cannot cancel while in transit
  DELIVERED: [], // Terminal state
  CANCELLED: []  // Terminal state
};

/**
 * Check if a state transition is valid
 * 
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Desired new status
 * @returns {boolean} True if transition is valid
 */
function isValidTransition(currentStatus, newStatus) {
  const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}

/**
 * Validate and perform state transition
 * 
 * @param {Object} order - Order document
 * @param {string} newStatus - Desired new status
 * @returns {Object} {success: boolean, error: string|null}
 */
async function validateAndTransitionState(order, newStatus) {
  if (!order) {
    return {
      success: false,
      error: 'Order not found'
    };
  }

  // Check if transition is valid
  if (!isValidTransition(order.status, newStatus)) {
    return {
      success: false,
      error: `Invalid state transition from ${order.status} to ${newStatus}. Valid transitions: ${VALID_TRANSITIONS[order.status]?.join(', ') || 'none'}`
    };
  }

  // Terminal states cannot be changed
  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    return {
      success: false,
      error: `Cannot change status from terminal state: ${order.status}`
    };
  }

  return {
    success: true,
    error: null
  };
}

/**
 * Auto-progress order state based on courier location
 * This is called during courier movement simulation
 * 
 * @param {Object} order - Order document
 * @param {Object} courier - Courier document
 * @returns {Object} {updated: boolean, newStatus: string|null, message: string}
 */
async function autoProgressState(order, courier) {
  if (!order || !courier) {
    return {
      updated: false,
      newStatus: null,
      message: 'Order or courier not found'
    };
  }

  // If order is already in terminal state, no progression
  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    return {
      updated: false,
      newStatus: order.status,
      message: 'Order is in terminal state'
    };
  }

  // Check if courier reached pickup location
  if (order.status === 'ASSIGNED') {
    if (isWithinThreshold(courier.location, order.pickupLocation)) {
      await Order.findByIdAndUpdate(order._id, {
        $set: { status: 'PICKED_UP' }
      });
      return {
        updated: true,
        newStatus: 'PICKED_UP',
        message: 'Courier reached pickup location'
      };
    }
  }

  // Check if courier reached drop location
  if (order.status === 'PICKED_UP' || order.status === 'IN_TRANSIT') {
    if (isWithinThreshold(courier.location, order.dropLocation)) {
      await Order.findByIdAndUpdate(order._id, {
        $set: { status: 'DELIVERED' }
      });
      
      // Release courier
      const { releaseCourier } = require('./assignmentService');
      await releaseCourier(courier._id);
      
      return {
        updated: true,
        newStatus: 'DELIVERED',
        message: 'Courier reached drop location. Order delivered!'
      };
    } else if (order.status === 'PICKED_UP') {
      // Courier has left pickup, now in transit
      await Order.findByIdAndUpdate(order._id, {
        $set: { status: 'IN_TRANSIT' }
      });
      return {
        updated: true,
        newStatus: 'IN_TRANSIT',
        message: 'Courier started moving to drop location'
      };
    }
  }

  return {
    updated: false,
    newStatus: order.status,
    message: 'No state progression needed'
  };
}

module.exports = {
  isValidTransition,
  validateAndTransitionState,
  autoProgressState,
  VALID_TRANSITIONS
};
