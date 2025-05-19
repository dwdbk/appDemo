require('dotenv').config();
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { auth } = require('express-oauth2-jwt-bearer');

// Utils and config
const logger = require('./utils/logger');
const { success, error: errorResponse } = require('./utils/apiResponse');
const env = require('./utils/env');

// Middleware
const requestLogger = require('./middleware/requestLogger.middleware');
const securityMiddleware = require('./middleware/security.middleware');
const corsMiddleware = require('./middleware/cors.middleware');
const { setupAuth, authMiddleware } = require('./middleware/auth.middleware');
const { setupProxies } = require('./middleware/proxy.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');

// Create Express app
const app = express();
const PORT = env.PORT;

// ========================
// 1. Basic Configuration
// ========================

// Trust first proxy (if behind a reverse proxy like Nginx)
app.set('trust proxy', 1);

// ========================
// 2. Middleware Setup
// ========================

// Security middleware (Helmet, HPP, etc.)
app.use(securityMiddleware);

// CORS configuration
app.use(corsMiddleware);

// Request logging (custom middleware)
app.use(requestLogger);

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// ========================
// 3. Health Check Endpoint
// ========================

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  const healthcheck = {
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
  };
  
  return success(res, healthcheck, 'Service is healthy');
});

// ========================
// 4. Authentication Setup
// ========================

// Setup Keycloak authentication
setupAuth(app);

// ========================
// 5. API Routes
// ========================

const API_PREFIX = '/api/v1';

// Auth routes
app.use(`${API_PREFIX}/auth`, authRoutes);

// Public API routes
app.use(`${API_PREFIX}/public`, (req, res) => {
  return success(res, { 
    message: 'Public API endpoint',
    timestamp: new Date().toISOString(),
  });
});

// Protected API routes (require authentication)
app.use(API_PREFIX, authMiddleware, (req, res, next) => {
  // Add any additional middleware for protected routes here
  next();
});

// ========================
// 6. API Gateway Proxies
// ========================

// Setup API Gateway Proxies
setupProxies(app);

// ========================
// 7. Error Handling
// ========================

// 404 handler
app.use((req, res) => {
  return errorResponse(res, 'Resource not found', 404);
});

// Global error handler
app.use((err, req, res, next) => {
  // Log the error with request ID if available
  const requestId = req.requestId || 'unknown';
  
  logger.error(`[${requestId}] Error in ${req.method} ${req.path}`, {
    error: err.message,
    stack: env.isDevelopment() ? err.stack : undefined,
    statusCode: err.statusCode || 500,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Handle JWT errors
  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return errorResponse(res, 'Unauthorized: Invalid or missing token', 401);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return errorResponse(res, 'Validation Error', 400, err.errors);
  }

  // Handle rate limit errors
  if (err.status === 429) {
    return errorResponse(res, 'Too many requests, please try again later', 429);
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = env.isProduction() && statusCode === 500 
    ? 'Internal Server Error' 
    : err.message;
  
  return errorResponse(
    res, 
    message, 
    statusCode, 
    env.isDevelopment() ? { 
      stack: err.stack,
      name: err.name,
      ...(err.details && { details: err.details })
    } : undefined
  );
});

// ========================
// 8. Server Startup
// ========================

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  
  // In production, you might want to gracefully shut down
  if (env.isProduction()) {
    logger.error('Unhandled rejection in production, shutting down...');
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  
  // In production, you might want to gracefully shut down
  if (env.isProduction()) {
    logger.error('Uncaught exception in production, shutting down...');
    process.exit(1);
  }
});

// Start the server only if this file is run directly
if (require.main === module) {
  const server = app.listen(PORT, () => {
    logger.info(`Gateway Service running on port ${PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Node.js version: ${process.version}`);
    logger.info(`Process ID: ${process.pid}`);
    logger.info(`Allowed Origins: ${env.ALLOWED_ORIGINS.join(', ')}`);
    logger.info(`Keycloak URL: ${env.KEYCLOAK_AUTH_SERVER_URL}`);
    logger.info(`Opera Service URL: ${env.OPERA_SERVICE_URL}`);
    logger.info(`Shows Service URL: ${env.SHOWS_SERVICE_URL}`);
    
    // Log memory usage
    const used = process.memoryUsage();
    for (let key in used) {
      logger.debug(`Memory: ${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
    }
  });

  // Handle graceful shutdown
  const shutdown = (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    
    // Close the server
    server.close((err) => {
      if (err) {
        logger.error('Error during shutdown', err);
        process.exit(1);
      }
      
      logger.info('Server closed');
      process.exit(0);
    });

    // Force close server after 10 seconds
    setTimeout(() => {
      logger.error('Forcing server shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  // Listen for termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Handle process exit
  process.on('exit', (code) => {
    logger.info(`Process exiting with code ${code}`);
  });
  
  module.exports = { app, server };
} else {
  // For testing
  module.exports = { app };
}
