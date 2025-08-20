const Chat = require('../models/Chat');

// @desc    Get user's chats
// @route   GET /api/chats
// @access  Private
exports.getChats = async (req, res) => {
  try {
    let chats;
    
    if (req.user.role === 'admin') {
      // Admin can see all chats or assigned chats
      const query = req.query.assigned === 'true' 
        ? { assignedTo: req.user.id }
        : {};
      
      chats = await Chat.find(query).sort({ 'lastMessage.timestamp': -1 });
    } else {
      // Regular users see only their chats
      chats = await Chat.find({
        'participants.user': req.user.id
      }).sort({ 'lastMessage.timestamp': -1 });
    }

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Get single chat
// @route   GET /api/chats/:id
// @access  Private
exports.getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    // Check if user is participant or admin
    const isParticipant = chat.participants.some(p => p.user._id.toString() === req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isParticipant && !isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado para ver este chat'
      });
    }

    // Mark messages as read
    await chat.markAsRead(req.user.id);

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Create new chat
// @route   POST /api/chats
// @access  Private
exports.createChat = async (req, res) => {
  try {
    const { subject, category, priority = 'medium', message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'El mensaje inicial es requerido'
      });
    }

    // Check if user already has an active chat
    const existingChat = await Chat.findOne({
      'participants.user': req.user.id,
      status: { $in: ['active', 'waiting'] }
    });

    if (existingChat) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes un chat activo. Úsalo para continuar la conversación.',
        chatId: existingChat._id
      });
    }

    // Create chat with user as participant
    const chat = await Chat.create({
      participants: [{
        user: req.user.id,
        role: 'customer'
      }],
      subject,
      category,
      priority,
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    });

    // Add initial message
    await chat.addMessage(req.user.id, message);

    res.status(201).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Add message to chat
// @route   POST /api/chats/:id/messages
// @access  Private
exports.addMessage = async (req, res) => {
  try {
    const { content, type = 'text' } = req.body;

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    // Check if user is participant or admin
    const isParticipant = chat.participants.some(p => p.user._id.toString() === req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isParticipant && !isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado para enviar mensajes en este chat'
      });
    }

    // Add message
    await chat.addMessage(req.user.id, content, type);

    // If admin is replying, make sure they're assigned
    if (isAdmin && !chat.assignedTo) {
      chat.assignedTo = req.user.id;
      await chat.save();
    }

    // Update chat status if needed
    if (chat.status === 'waiting' && isAdmin) {
      chat.status = 'active';
      await chat.save();
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Assign chat to support agent
// @route   PUT /api/chats/:id/assign
// @access  Private/Admin
exports.assignChat = async (req, res) => {
  try {
    const { agentId } = req.body;

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    await chat.assignTo(agentId || req.user.id);

    res.status(200).json({
      success: true,
      message: 'Chat asignado exitosamente',
      data: chat
    });
  } catch (error) {
    console.error('Assign chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Close chat
// @route   PUT /api/chats/:id/close
// @access  Private
exports.closeChat = async (req, res) => {
  try {
    const { reason } = req.body;

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    // Check permissions
    const isParticipant = chat.participants.some(p => p.user._id.toString() === req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isParticipant && !isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado para cerrar este chat'
      });
    }

    await chat.close(req.user.id, reason);

    res.status(200).json({
      success: true,
      message: 'Chat cerrado exitosamente',
      data: chat
    });
  } catch (error) {
    console.error('Close chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Resolve chat
// @route   PUT /api/chats/:id/resolve
// @access  Private/Admin
exports.resolveChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    await chat.resolve(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Chat marcado como resuelto',
      data: chat
    });
  } catch (error) {
    console.error('Resolve chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Rate chat satisfaction
// @route   PUT /api/chats/:id/rate
// @access  Private
exports.rateChat = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    // Check if user is the customer
    const isCustomer = chat.participants.some(
      p => p.user._id.toString() === req.user.id && p.role === 'customer'
    );

    if (!isCustomer) {
      return res.status(401).json({
        success: false,
        message: 'Solo el cliente puede calificar el chat'
      });
    }

    await chat.rateSatisfaction(rating, feedback);

    res.status(200).json({
      success: true,
      message: 'Calificación enviada exitosamente',
      data: chat
    });
  } catch (error) {
    console.error('Rate chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Get unassigned chats (Admin only)
// @route   GET /api/chats/unassigned
// @access  Private/Admin
exports.getUnassignedChats = async (req, res) => {
  try {
    const chats = await Chat.getUnassignedChats();

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (error) {
    console.error('Get unassigned chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};

// @desc    Get chat analytics (Admin only)
// @route   GET /api/chats/analytics
// @access  Private/Admin
exports.getChatAnalytics = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Overall stats
    const totalChats = await Chat.countDocuments();
    const activeChats = await Chat.countDocuments({ status: 'active' });
    const resolvedChats = await Chat.countDocuments({ status: 'resolved' });
    const monthlyChats = await Chat.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Category distribution
    const categoryStats = await Chat.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Priority distribution
    const priorityStats = await Chat.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average satisfaction rating
    const satisfactionStats = await Chat.aggregate([
      {
        $match: { 'satisfaction.rating': { $exists: true } }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$satisfaction.rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    // Response time analytics
    const responseTimeStats = await Chat.aggregate([
      {
        $match: { averageResponseTime: { $exists: true } }
      },
      {
        $group: {
          _id: null,
          averageResponseTime: { $avg: '$averageResponseTime' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalChats,
          activeChats,
          resolvedChats,
          monthlyChats
        },
        categoryStats,
        priorityStats,
        satisfaction: satisfactionStats[0] || { averageRating: 0, totalRatings: 0 },
        averageResponseTime: responseTimeStats[0]?.averageResponseTime || 0
      }
    });
  } catch (error) {
    console.error('Get chat analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
  }
};