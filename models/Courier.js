const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    x: {
      type: Number,
      required: true,
      default: 0
    },
    y: {
      type: Number,
      required: true,
      default: 0
    }
  },
  isAvailable: {
    type: Boolean,
    required: true,
    default: true
  },
  activeOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
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

// Index for efficient querying of available couriers
courierSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('Courier', courierSchema);
