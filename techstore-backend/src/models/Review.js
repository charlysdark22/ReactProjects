const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título de la reseña es requerido'],
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  comment: {
    type: String,
    required: [true, 'El comentario es requerido'],
    maxlength: [1000, 'El comentario no puede exceder 1000 caracteres']
  },
  rating: {
    type: Number,
    required: [true, 'La calificación es requerida'],
    min: 1,
    max: 5
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }]
  },
  reported: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  moderationNote: String
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ product: 1, user: 1 }, { unique: true }); // One review per user per product
reviewSchema.index({ product: 1, rating: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ moderationStatus: 1 });

// Populate user info when querying reviews
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName avatar'
  });
  next();
});

// Static method to calculate average rating for a product
reviewSchema.statics.calcAverageRatings = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { 
        product: productId,
        isActive: true,
        moderationStatus: 'approved'
      }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  try {
    const Product = mongoose.model('Product');
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        'rating.average': Math.round(stats[0].averageRating * 10) / 10,
        'rating.count': stats[0].reviewCount
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        'rating.average': 0,
        'rating.count': 0
      });
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

// Call calcAverageRatings after save and remove
reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.product);
});

reviewSchema.post('remove', function() {
  this.constructor.calcAverageRatings(this.product);
});

// Method to mark review as helpful
reviewSchema.methods.markHelpful = function(userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count += 1;
  }
  return this.save();
};

// Method to unmark review as helpful
reviewSchema.methods.unmarkHelpful = function(userId) {
  const index = this.helpful.users.indexOf(userId);
  if (index > -1) {
    this.helpful.users.splice(index, 1);
    this.helpful.count -= 1;
  }
  return this.save();
};

// Method to report review
reviewSchema.methods.reportReview = function(userId) {
  if (!this.reported.users.includes(userId)) {
    this.reported.users.push(userId);
    this.reported.count += 1;
  }
  return this.save();
};

// Virtual for formatted date
reviewSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('es-CU');
});

module.exports = mongoose.model('Review', reviewSchema);