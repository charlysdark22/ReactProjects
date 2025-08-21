const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = require('./config/database');
connectDB();

// Route files
const auth = require('./routes/auth');
const products = require('./routes/products');
const reviews = require('./routes/reviews');
const orders = require('./routes/orders');
const chats = require('./routes/chats');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimit');

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join chat room
  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  // Leave chat room
  socket.on('leave-chat', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.id} left chat ${chatId}`);
  });

  // Handle new message
  socket.on('send-message', (data) => {
    const { chatId, message } = data;
    // Broadcast to all users in the chat room
    socket.to(chatId).emit('new-message', message);
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { chatId, isTyping, userName } = data;
    socket.to(chatId).emit('user-typing', { isTyping, userName });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
app.use(generalLimiter);

// Compression middleware
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(require('cookie-parser')());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static folder
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Mount routers
app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/reviews', reviews);
app.use('/api/orders', orders);
app.use('/api/chats', chats);

// Error handler
app.use(errorHandler);

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📱 Socket.IO server ready for connections`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  server.close(() => {
    console.log('Process terminated');
  });
});