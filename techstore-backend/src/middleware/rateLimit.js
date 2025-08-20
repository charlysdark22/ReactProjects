const rateLimit = require('express-rate-limit');

// General rate limiting
exports.generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for auth routes
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for password reset
exports.passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Demasiados intentos de recuperación de contraseña, intenta de nuevo en 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for creating reviews
exports.reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 reviews per hour
  message: {
    success: false,
    message: 'Demasiadas reseñas creadas, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for chat messages
exports.chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 messages per minute
  message: {
    success: false,
    message: 'Demasiados mensajes enviados, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});