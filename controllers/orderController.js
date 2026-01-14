const Order = require('../models/Order');
const { autoAssignCourier, releaseCourier } = require('../services/assignmentService');
const { validateAndTransitionState } = require('../services/stateService');

/**
 * Create a new order
 * POST /orders
 */
async function createOrder(req, res) {
  try {
    const { pickupLocation, dropLocation, deliveryType } = req.body;

    // Validation
    if (!pickupLocation || typeof pickupLocation.x !== 'number' || typeof pickupLocation.y !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid pickupLocation. Must have x and y coordinates (numbers)'
      });
    }

    if (!dropLocation || typeof dropLocation.x !== 'number' || typeof dropLocation.y !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid dropLocation. Must have x and y coordinates (numbers)'
      });
    }

    if (!deliveryType || !['EXPRESS', 'NORMAL'].includes(deliveryType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid deliveryType. Must be EXPRESS or NORMAL'
      });
    }

    // Create order
    const order = new Order({
      pickupLocation,
      dropLocation,
      deliveryType,
      status: 'CREATED'
    });

    await order.save();

    // Attempt auto-assignment
    const assignmentResult = await autoAssignCourier(order);

    // Refresh order to get latest status
    const updatedOrder = await Order.findById(order._id).populate('courierId', 'name location');

    if (assignmentResult.success) {
      return res.status(201).json({
        success: true,
        message: 'Order created and courier assigned successfully',
        order: updatedOrder,
        courier: assignmentResult.courier
      });
    } else {
      // Order created but not assigned
      return res.status(200).json({
        success: true,
        message: 'Order created but not assigned',
        order: updatedOrder,
        reason: assignmentResult.reason
      });
    }

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * Cancel an order
 * POST /orders/:id/cancel
 */
async function cancelOrder(req, res) {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Validate cancellation is allowed
    const validation = await validateAndTransitionState(order, 'CANCELLED');
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Cancel order
    order.status = 'CANCELLED';
    await order.save();

    // Release courier if order was assigned
    if (order.courierId) {
      await releaseCourier(order.courierId);
    }

    const updatedOrder = await Order.findById(id).populate('courierId', 'name location');

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * Get order by ID
 * GET /orders/:id
 */
async function getOrder(req, res) {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate('courierId', 'name location isAvailable');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * Get all orders
 * GET /orders
 */
async function getAllOrders(req, res) {
  try {
    const { status, deliveryType } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (deliveryType) filter.deliveryType = deliveryType;

    const orders = await Order.find(filter)
      .populate('courierId', 'name location isAvailable')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  createOrder,
  cancelOrder,
  getOrder,
  getAllOrders
};
