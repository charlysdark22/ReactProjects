const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: {
      values: ['desktop', 'laptop', 'phone', 'accessories'],
      message: 'La categoría debe ser: desktop, laptop, phone, o accessories'
    }
  },
  brand: {
    type: String,
    required: [true, 'La marca es requerida'],
    trim: true,
    maxlength: [50, 'La marca no puede exceder 50 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  comparePrice: {
    type: Number,
    min: [0, 'El precio de comparación no puede ser negativo']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  specifications: {
    type: Map,
    of: String
  },
  features: [String],
  tags: [String],
  sku: {
    type: String,
    unique: true,
    required: true
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'g', 'lb'],
      default: 'kg'
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Review'
  }],
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  warranty: {
    duration: Number,
    unit: {
      type: String,
      enum: ['days', 'months', 'years'],
      default: 'months'
    },
    description: String
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });

// Virtual for main image
productSchema.virtual('mainImage').get(function() {
  const mainImage = this.images.find(img => img.isMain);
  return mainImage ? mainImage.url : (this.images[0] ? this.images[0].url : null);
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Pre-save middleware to generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku) {
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    const brandCode = this.brand.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    this.sku = `${categoryCode}-${brandCode}-${timestamp}`;
  }
  next();
});

// Static method to get products by category
productSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ createdAt: -1 });
};

// Static method to search products
productSchema.statics.searchProducts = function(query) {
  return this.find({
    $text: { $search: query },
    isActive: true
  }).sort({ score: { $meta: 'textScore' } });
};

// Static method to get featured products
productSchema.statics.getFeatured = function() {
  return this.find({ isFeatured: true, isActive: true }).sort({ createdAt: -1 });
};

// Method to update rating
productSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    {
      $match: { product: this._id }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.rating.average = Math.round(stats[0].averageRating * 10) / 10;
    this.rating.count = stats[0].reviewCount;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }

  await this.save();
};

module.exports = mongoose.model('Product', productSchema);