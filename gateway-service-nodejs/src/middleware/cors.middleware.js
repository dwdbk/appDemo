const env = require('../utils/env');
const logger = require('../utils/logger');

/**
 * CORS middleware with enhanced security and logging
 * @returns {Function} Express middleware function
 */
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  const allowedOrigins = env.ALLOWED_ORIGINS || [];
  const isAllowedOrigin = !origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*');
  
  // Set CORS headers
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (isAllowedOrigin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    logger.warn(`Blocked request from unauthorized origin: ${origin}`);
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Origin not allowed by CORS policy',
    });
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token'
    );
    res.header('Access-Control-Max-Age', '600'); // 10 minutes
    return res.status(204).end();
  }
  
  // Log CORS requests in development
  if (env.isDevelopment()) {
    logger.debug(`CORS request from: ${origin} to ${req.method} ${req.path}`);
  }
  
  next();
};

module.exports = corsMiddleware;
