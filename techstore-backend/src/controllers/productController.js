const Product = require('../models/Product');
const Review = require('../models/Review');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    let query = { isActive: true };

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Parse back to object and merge with base query
    query = { ...query, ...JSON.parse(queryStr) };

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = req.query.minPrice;
      if (req.query.maxPrice) query.price.$lte = req.query.maxPrice;
    }

    // Brand filter
    if (req.query.brand) {
      query.brand = { $in: req.query.brand.split(',') };
    }

    // Rating filter
    if (req.query.minRating) {
      query['rating.average'] = { $gte: req.query.minRating };
    }

    // In stock filter
    if (req.query.inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Featured filter
    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    // Finding resource
    let queryResult = Product.find(query);

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      queryResult = queryResult.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      queryResult = queryResult.sort(sortBy);
    } else {
      queryResult = queryResult.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments(query);

    queryResult = queryResult.skip(startIndex).limit(limit);

    // Populate reviews count
    queryResult = queryResult.populate({
      path: 'reviews',
      select: 'rating'
    });

    // Executing query
    const products = await queryResult;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    // Get aggregated data for filters
    const aggregation = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          brands: { $addToSet: '$brand' },
          categories: { $addToSet: '$category' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgRating: { $avg: '$rating.average' }
        }
      }
    ]);

    const filters = aggregation.length > 0 ? aggregation[0] : {};

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination,
      filters,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'firstName lastName avatar'
        }
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Get related products
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true
    }).limit(4).select('name price images rating');

    res.status(200).json({
      success: true,
      data: product,
      relatedProducts
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Handle images
    if (req.body.images && typeof req.body.images === 'string') {
      req.body.images = [{ url: req.body.images, isMain: true }];
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Soft delete - just mark as inactive
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category,
      isActive: true
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Search products
// @route   GET /api/products/search/:query
// @access  Public
exports.searchProducts = async (req, res) => {
  try {
    const searchQuery = req.params.query;

    const products = await Product.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } },
            { brand: { $regex: searchQuery, $options: 'i' } },
            { tags: { $in: [new RegExp(searchQuery, 'i')] } }
          ]
        }
      ]
    }).sort({ score: { $meta: 'textScore' }, '-createdAt': 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isFeatured: true,
      isActive: true
    }).sort('-createdAt').limit(8);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private/Admin
exports.updateStock = async (req, res) => {
  try {
    const { stock, operation } = req.body; // operation: 'set', 'add', 'subtract'

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    switch (operation) {
      case 'set':
        product.stock = stock;
        break;
      case 'add':
        product.stock += stock;
        break;
      case 'subtract':
        product.stock = Math.max(0, product.stock - stock);
        break;
      default:
        product.stock = stock;
    }

    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Get product analytics
// @route   GET /api/products/analytics
// @access  Private/Admin
exports.getProductAnalytics = async (req, res) => {
  try {
    const analytics = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
          avgPrice: { $avg: '$price' },
          avgRating: { $avg: '$rating.average' },
          totalStock: { $sum: '$stock' },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          },
          lowStock: {
            $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$lowStockThreshold'] }] }, 1, 0] }
          }
        }
      }
    ]);

    const categoryStats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' }
        }
      }
    ]);

    const brandStats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: analytics[0] || {},
        categoryStats,
        brandStats
      }
    });
  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};