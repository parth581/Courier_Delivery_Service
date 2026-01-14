const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  pickupLocation: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    }
  },
  dropLocation: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    }
  },
  deliveryType: {
    type: String,
    enum: ['EXPRESS', 'NORMAL'],
    required: true
  },
  status: {
    type: String,
    enum: ['CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
    default: 'CREATED',
    required: true
  },
  courierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Courier',
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Convert UTC timestamps to IST (UTC+5:30)
      if (ret.createdAt) {
        ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      }
      if (ret.updatedAt) {
        ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      }
      return ret;
    }
  }
});

// Index for efficient querying
orderSchema.index({ status: 1 });
orderSchema.index({ courierId: 1 });

module.exports = mongoose.model('Order', orderSchema);
