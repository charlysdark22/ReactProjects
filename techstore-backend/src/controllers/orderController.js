const Order = require('../models/Order');
const Product = require('../models/Product');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    let query = {};

    // Filter by status
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }

    // Filter by payment status
    if (req.query.paymentStatus) {
      query['paymentInfo.status'] = req.query.paymentStatus;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort('-createdAt')
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
      count: orders.length,
      total,
      pagination,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Make sure user is order owner or admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'No autorizado para ver esta orden'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      paymentInfo = {}
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay items en la orden'
      });
    }

    // Verify products and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Producto no encontrado: ${item.product}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.mainImage,
        sku: product.sku
      });
    }

    // Calculate shipping (free for orders over $100)
    const shippingCost = subtotal >= 100 ? 0 : 10;

    // Calculate tax (0% for Cuba)
    const tax = 0;

    // Calculate total
    const total = subtotal + shippingCost + tax;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentInfo: {
        method: paymentMethod,
        amount: total,
        ...paymentInfo
      },
      subtotal,
      tax,
      shipping: {
        cost: shippingCost,
        method: 'standard'
      },
      total
    });

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    await order.updateStatus(status, note, req.user.id);

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Make sure user is order owner or admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'No autorizado para cancelar esta orden'
      });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar esta orden en su estado actual'
      });
    }

    await order.cancel(reason, req.user.id);

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Orden cancelada exitosamente',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Process payment with Stripe
// @route   POST /api/orders/:id/pay/stripe
// @access  Private
exports.processStripePayment = async (req, res) => {
  try {
    const { paymentMethodId } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Make sure user is order owner
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Update order payment info
      order.paymentInfo.status = 'completed';
      order.paymentInfo.transactionId = paymentIntent.id;
      order.paymentInfo.stripePaymentIntentId = paymentIntent.id;
      order.paymentInfo.paymentDate = new Date();
      order.orderStatus = 'confirmed';

      await order.save();

      res.status(200).json({
        success: true,
        message: 'Pago procesado exitosamente',
        data: {
          paymentIntent: {
            id: paymentIntent.id,
            status: paymentIntent.status
          },
          order
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Error procesando el pago',
        paymentIntent
      });
    }
  } catch (error) {
    console.error('Stripe payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando el pago',
      error: error.message
    });
  }
};

// @desc    Process Cuban payment methods
// @route   POST /api/orders/:id/pay/cuban
// @access  Private
exports.processCubanPayment = async (req, res) => {
  try {
    const { method, phoneNumber, cardNumber, bank, accountNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Make sure user is order owner
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    // Generate transaction ID
    const transactionId = `${method.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Update order payment info based on method
    order.paymentInfo.method = method;
    order.paymentInfo.transactionId = transactionId;
    order.paymentInfo.paymentDate = new Date();

    switch (method) {
      case 'transfermovil':
        order.paymentInfo.phoneNumber = phoneNumber;
        order.paymentInfo.status = 'completed'; // Assume immediate confirmation
        order.orderStatus = 'confirmed';
        break;
      
      case 'enzona':
        order.paymentInfo.cardLast4 = cardNumber ? cardNumber.slice(-4) : '';
        order.paymentInfo.status = 'completed';
        order.orderStatus = 'confirmed';
        break;
      
      case 'bank_transfer':
        order.paymentInfo.bankName = bank;
        order.paymentInfo.accountNumber = accountNumber;
        order.paymentInfo.status = 'pending'; // Requires manual verification
        order.orderStatus = 'pending';
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Método de pago no válido'
        });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: method === 'bank_transfer' 
        ? 'Transferencia registrada. Será verificada en 24-48 horas.'
        : 'Pago procesado exitosamente',
      data: {
        transactionId,
        order
      }
    });
  } catch (error) {
    console.error('Cuban payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando el pago',
      error: error.message
    });
  }
};

// @desc    Get order analytics
// @route   GET /api/orders/analytics
// @access  Private/Admin
exports.getOrderAnalytics = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

    // Overall stats
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { 'paymentInfo.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // This month stats
    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          'paymentInfo.status': 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Order status distribution
    const statusStats = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Payment method distribution
    const paymentMethodStats = await Order.aggregate([
      {
        $group: {
          _id: '$paymentInfo.method',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);

    // Daily orders for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalOrders,
          totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
          monthlyOrders,
          monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0
        },
        statusStats,
        paymentMethodStats,
        dailyOrders,
        topProducts
      }
    });
  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};