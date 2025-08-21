const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: String,
    sku: String
  }],
  shippingAddress: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: String,
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Cuba'
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  paymentInfo: {
    method: {
      type: String,
      required: true,
      enum: ['transfermovil', 'enzona', 'bank_transfer', 'stripe', 'cash_on_delivery']
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentDate: Date,
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    // For Cuban payment methods
    phoneNumber: String, // Transfermóvil
    cardLast4: String, // Enzona
    bankName: String, // Bank transfer
    accountNumber: String, // Bank transfer
    // For Stripe
    stripePaymentIntentId: String,
    stripeChargeId: String
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  shipping: {
    cost: {
      type: Number,
      default: 0
    },
    method: {
      type: String,
      default: 'standard'
    },
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date
  },
  discount: {
    amount: {
      type: Number,
      default: 0
    },
    code: String,
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'fixed'
    }
  },
  total: {
    type: Number,
    required: true
  },
  notes: String,
  isGift: {
    type: Boolean,
    default: false
  },
  giftMessage: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  refundAmount: Number,
  refundReason: String,
  refundedAt: Date
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ 'paymentInfo.status': 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `TS-${timestamp.slice(-8)}-${random}`;
  }
  next();
});

// Pre-save middleware to add status to history
orderSchema.pre('save', function(next) {
  if (this.isModified('orderStatus')) {
    this.statusHistory.push({
      status: this.orderStatus,
      date: new Date()
    });
  }
  next();
});

// Populate product details
orderSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName email phone'
  }).populate({
    path: 'items.product',
    select: 'name images category brand'
  });
  next();
});

// Static method to get orders by status
orderSchema.statics.getByStatus = function(status) {
  return this.find({ orderStatus: status }).sort({ createdAt: -1 });
};

// Static method to get user orders
orderSchema.statics.getUserOrders = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

// Method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  this.total = this.subtotal + this.tax + this.shipping.cost - this.discount.amount;
  return this;
};

// Method to update status
orderSchema.methods.updateStatus = function(newStatus, note = '', updatedBy = null) {
  this.orderStatus = newStatus;
  this.statusHistory.push({
    status: newStatus,
    date: new Date(),
    note,
    updatedBy
  });

  // Set specific dates based on status
  switch (newStatus) {
    case 'delivered':
      this.deliveredAt = new Date();
      break;
    case 'cancelled':
      this.cancelledAt = new Date();
      break;
    case 'refunded':
      this.refundedAt = new Date();
      break;
  }

  return this.save();
};

// Method to cancel order
orderSchema.methods.cancel = function(reason, cancelledBy = null) {
  this.orderStatus = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  
  this.statusHistory.push({
    status: 'cancelled',
    date: new Date(),
    note: reason,
    updatedBy: cancelledBy
  });

  return this.save();
};

// Virtual for order age in days
orderSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for current status info
orderSchema.virtual('currentStatus').get(function() {
  return this.statusHistory[this.statusHistory.length - 1];
});

module.exports = mongoose.model('Order', orderSchema);