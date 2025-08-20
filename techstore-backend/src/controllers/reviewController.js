const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    let query = { isActive: true, moderationStatus: 'approved' };

    // Filter by product
    if (req.query.product) {
      query.product = req.query.product;
    }

    // Filter by rating
    if (req.query.rating) {
      query.rating = req.query.rating;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Review.countDocuments(query);

    // Sort
    let sortBy = '-createdAt';
    if (req.query.sort === 'helpful') {
      sortBy = '-helpful.count -createdAt';
    } else if (req.query.sort === 'rating-high') {
      sortBy = '-rating -createdAt';
    } else if (req.query.sort === 'rating-low') {
      sortBy = 'rating -createdAt';
    }

    const reviews = await Review.find(query)
      .populate({
        path: 'user',
        select: 'firstName lastName avatar'
      })
      .populate({
        path: 'product',
        select: 'name images'
      })
      .sort(sortBy)
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      pagination,
      data: reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'firstName lastName avatar'
      })
      .populate({
        path: 'product',
        select: 'name images category'
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { title, comment, rating, product } = req.body;

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user.id,
      product
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Ya has reseñado este producto'
      });
    }

    const review = await Review.create({
      title,
      comment,
      rating,
      product,
      user: req.user.id
    });

    // Populate the review
    await review.populate({
      path: 'user',
      select: 'firstName lastName avatar'
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    // Make sure user is review owner
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'No autorizado para actualizar esta reseña'
      });
    }

    // Reset moderation status if content is changed
    if (req.body.title || req.body.comment || req.body.rating) {
      req.body.moderationStatus = 'pending';
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'user',
      select: 'firstName lastName avatar'
    });

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    // Make sure user is review owner or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'No autorizado para eliminar esta reseña'
      });
    }

    await review.remove();

    res.status(200).json({
      success: true,
      message: 'Reseña eliminada exitosamente'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    // Check if user already marked as helpful
    if (review.helpful.users.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Ya marcaste esta reseña como útil'
      });
    }

    await review.markHelpful(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Reseña marcada como útil',
      data: review
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Unmark review as helpful
// @route   DELETE /api/reviews/:id/helpful
// @access  Private
exports.unmarkHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    await review.unmarkHelpful(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Reseña desmarcada como útil',
      data: review
    });
  } catch (error) {
    console.error('Unmark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Report review
// @route   PUT /api/reviews/:id/report
// @access  Private
exports.reportReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    // Check if user already reported
    if (review.reported.users.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Ya reportaste esta reseña'
      });
    }

    await review.reportReview(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Reseña reportada exitosamente'
    });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Moderate review (Admin only)
// @route   PUT /api/reviews/:id/moderate
// @access  Private/Admin
exports.moderateReview = async (req, res) => {
  try {
    const { moderationStatus, moderationNote } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus,
        moderationNote,
        moderatedBy: req.user.id,
        moderatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Reseña no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reseña moderada exitosamente',
      data: review
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Get reviews for moderation (Admin only)
// @route   GET /api/reviews/moderation
// @access  Private/Admin
exports.getReviewsForModeration = async (req, res) => {
  try {
    const reviews = await Review.find({
      $or: [
        { moderationStatus: 'pending' },
        { 'reported.count': { $gte: 1 } }
      ]
    })
      .populate({
        path: 'user',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'product',
        select: 'name images'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get reviews for moderation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Get review statistics
// @route   GET /api/reviews/stats/:productId
// @access  Public
exports.getReviewStats = async (req, res) => {
  try {
    const productId = req.params.productId;

    const stats = await Review.aggregate([
      {
        $match: {
          product: mongoose.Types.ObjectId(productId),
          isActive: true,
          moderationStatus: 'approved'
        }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    const totalReviews = await Review.countDocuments({
      product: productId,
      isActive: true,
      moderationStatus: 'approved'
    });

    const averageRating = await Review.aggregate([
      {
        $match: {
          product: mongoose.Types.ObjectId(productId),
          isActive: true,
          moderationStatus: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' }
        }
      }
    ]);

    // Format rating distribution
    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      const found = stats.find(stat => stat._id === i);
      ratingDistribution[i] = found ? found.count : 0;
    }

    res.status(200).json({
      success: true,
      data: {
        totalReviews,
        averageRating: averageRating.length > 0 ? Math.round(averageRating[0].average * 10) / 10 : 0,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};