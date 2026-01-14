const Courier = require('../models/Courier');
const Order = require('../models/Order');
const { calculateManhattanDistance } = require('../utils/distance');

const EXPRESS_DISTANCE_THRESHOLD = 10;

/**
 * Auto-assign the nearest eligible courier to an order
 * This function is atomic and handles concurrency safely
 * 
 * @param {Object} order - Order document
 * @returns {Object} {success: boolean, courier: Object|null, reason: string}
 */
async function autoAssignCourier(order) {
  try {
    // Find all available couriers
    const availableCouriers = await Courier.find({ 
      isAvailable: true,
      activeOrderId: null
    });

    if (availableCouriers.length === 0) {
      return {
        success: false,
        courier: null,
        reason: 'No available couriers at the moment'
      };
    }

    // Calculate distances and filter eligible couriers
    const eligibleCouriers = availableCouriers
      .map(courier => {
        const distance = calculateManhattanDistance(
          courier.location,
          order.pickupLocation
        );
        return { courier, distance };
      })
      .filter(({ distance }) => {
        // Express orders: only if distance <= threshold
        // Normal orders: no distance limit
        if (order.deliveryType === 'EXPRESS') {
          return distance <= EXPRESS_DISTANCE_THRESHOLD;
        }
        return true; // Normal orders have no limit
      })
      .sort((a, b) => a.distance - b.distance); // Sort by distance (nearest first)

    if (eligibleCouriers.length === 0) {
      const reason = order.deliveryType === 'EXPRESS'
        ? `No courier available within ${EXPRESS_DISTANCE_THRESHOLD} units for EXPRESS delivery`
        : 'No eligible couriers found';
      
      return {
        success: false,
        courier: null,
        reason
      };
    }

    // Attempt atomic assignment for each eligible courier (in order of distance)
    for (const { courier } of eligibleCouriers) {
      // Atomic update: only assign if courier is still available
      const updatedCourier = await Courier.findOneAndUpdate(
        {
          _id: courier._id,
          isAvailable: true,
          activeOrderId: null
        },
        {
          $set: {
            isAvailable: false,
            activeOrderId: order._id
          }
        },
        {
          new: true
        }
      );

      // If update succeeded, this courier was successfully assigned
      if (updatedCourier) {
        // Update order status to ASSIGNED
        await Order.findByIdAndUpdate(order._id, {
          $set: {
            status: 'ASSIGNED',
            courierId: updatedCourier._id
          }
        });

        return {
          success: true,
          courier: updatedCourier,
          reason: null
        };
      }
      // If update failed, courier was taken by another request, try next one
    }

    // All couriers were taken by concurrent requests
    return {
      success: false,
      courier: null,
      reason: 'All eligible couriers were assigned to other orders (concurrent request conflict)'
    };

  } catch (error) {
    console.error('Error in autoAssignCourier:', error);
    throw error;
  }
}

/**
 * Release a courier after order completion or cancellation
 * 
 * @param {Object} courierId - Courier ID
 */
async function releaseCourier(courierId) {
  await Courier.findByIdAndUpdate(courierId, {
    $set: {
      isAvailable: true,
      activeOrderId: null
    }
  });
}

module.exports = {
  autoAssignCourier,
  releaseCourier,
  EXPRESS_DISTANCE_THRESHOLD
};
