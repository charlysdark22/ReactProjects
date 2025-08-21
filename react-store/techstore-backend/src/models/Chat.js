const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [1000, 'El mensaje no puede exceder 1000 caracteres']
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['customer', 'support'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: Date
  }],
  subject: {
    type: String,
    maxlength: [200, 'El asunto no puede exceder 200 caracteres']
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'billing', 'shipping', 'returns', 'other'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'waiting', 'resolved', 'closed'],
    default: 'active'
  },
  messages: [messageSchema],
  tags: [String],
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    timestamp: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String,
    sessionId: String
  },
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  },
  resolvedAt: Date,
  closedAt: Date,
  averageResponseTime: Number, // in minutes
  totalMessages: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ status: 1 });
chatSchema.index({ category: 1 });
chatSchema.index({ priority: 1 });
chatSchema.index({ assignedTo: 1 });
chatSchema.index({ createdAt: -1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });

// Populate participants
chatSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'participants.user',
    select: 'firstName lastName avatar email role'
  }).populate({
    path: 'assignedTo',
    select: 'firstName lastName avatar'
  }).populate({
    path: 'messages.sender',
    select: 'firstName lastName avatar role'
  });
  next();
});

// Method to add message
chatSchema.methods.addMessage = function(senderId, content, type = 'text', fileData = null) {
  const message = {
    sender: senderId,
    content,
    type,
    ...(fileData && {
      fileUrl: fileData.url,
      fileName: fileData.name,
      fileSize: fileData.size
    })
  };

  this.messages.push(message);
  this.lastMessage = {
    content,
    sender: senderId,
    timestamp: new Date()
  };
  this.totalMessages += 1;

  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userId) {
  const unreadMessages = this.messages.filter(
    msg => !msg.isRead && msg.sender.toString() !== userId.toString()
  );

  unreadMessages.forEach(msg => {
    msg.isRead = true;
    msg.readAt = new Date();
  });

  return this.save();
};

// Method to assign to support agent
chatSchema.methods.assignTo = function(agentId) {
  this.assignedTo = agentId;
  this.addMessage(agentId, 'Chat asignado a agente de soporte', 'system');
  return this.save();
};

// Method to close chat
chatSchema.methods.close = function(closedBy, reason = '') {
  this.status = 'closed';
  this.closedAt = new Date();
  
  const systemMessage = reason 
    ? `Chat cerrado: ${reason}`
    : 'Chat cerrado por el agente';
  
  this.addMessage(closedBy, systemMessage, 'system');
  return this.save();
};

// Method to resolve chat
chatSchema.methods.resolve = function(resolvedBy) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.addMessage(resolvedBy, 'Chat marcado como resuelto', 'system');
  return this.save();
};

// Method to rate satisfaction
chatSchema.methods.rateSatisfaction = function(rating, feedback = '') {
  this.satisfaction = {
    rating,
    feedback,
    ratedAt: new Date()
  };
  return this.save();
};

// Static method to get active chats for user
chatSchema.statics.getActiveChatsForUser = function(userId) {
  return this.find({
    'participants.user': userId,
    status: { $in: ['active', 'waiting'] }
  }).sort({ 'lastMessage.timestamp': -1 });
};

// Static method to get unassigned chats
chatSchema.statics.getUnassignedChats = function() {
  return this.find({
    assignedTo: null,
    status: 'active'
  }).sort({ priority: -1, createdAt: 1 });
};

// Static method to get chats by agent
chatSchema.statics.getChatsByAgent = function(agentId) {
  return this.find({
    assignedTo: agentId,
    status: { $in: ['active', 'waiting'] }
  }).sort({ priority: -1, 'lastMessage.timestamp': -1 });
};

// Virtual for customer participant
chatSchema.virtual('customer').get(function() {
  return this.participants.find(p => p.role === 'customer');
});

// Virtual for support participant
chatSchema.virtual('supportAgent').get(function() {
  return this.participants.find(p => p.role === 'support');
});

// Virtual for unread message count
chatSchema.virtual('unreadCount').get(function() {
  return this.messages.filter(msg => !msg.isRead).length;
});

module.exports = mongoose.model('Chat', chatSchema);