const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { createClient } = require('redis');
const { logger } = require('../utils/logger');
const env = require('../utils/env');

// Create Redis client for rate limiting
const redisClient = createClient({
  url: `redis://${env.REDIS_HOST || 'localhost'}:${env.REDIS_PORT || 6379}`,
  password: env.REDIS_PASSWORD || undefined,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Too many retries on Redis connection. Rate limiting may be affected.');
        return new Error('Redis connection retry limit exceeded');
      }
      return Math.min(retries * 100, 5000);
    },
  },
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  logger.error('Redis client error in rate limiter:', err);
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    logger.info('Redis connected for rate limiting');
  } catch (err) {
    logger.error('Failed to connect to Redis for rate limiting:', err);
  }
})();

// Common rate limit message handler
const rateLimitMessage = (req, res) => {
  res.status(429).json({
    status: 'error',
    error: 'Too many requests, please try again later.',
  });
};

/**
 * Create a rate limiter with Redis store
 * @param {Object} options - Rate limiter options
 * @returns {Function} - Rate limiter middleware
 */
const createRateLimiter = (options) => {
  const defaultOptions = {
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: 'rate-limit:',
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes by default
    max: 100, // Limit each IP to 100 requests per windowMs by default
    handler: rateLimitMessage,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipFailedRequests: true, // Skip failed requests (status >= 400)
    skipSuccessfulRequests: false,
    keyGenerator: (req) => {
      // Use IP + JWT user ID if available for authenticated users
      const ip = req.ip || req.connection.remoteAddress;
      const userId = req.user?.id || 'anonymous';
      return `${ip}:${userId}`;
    },
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// Rate limiting configuration for API endpoints
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  skip: (req) => {
    // Skip rate limiting for health checks and static files
    return req.path === '/health' || req.path.startsWith('/static/');
  },
});

// More aggressive rate limiting for authentication endpoints
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      error: 'Too many login attempts, please try again later.',
    });
  },
});

// Rate limiting for public API endpoints with higher limits
const publicApiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  skip: (req) => {
    // Skip rate limiting for OPTIONS requests (CORS preflight)
    return req.method === 'OPTIONS';
  },
});

// Rate limiting for sensitive operations
const sensitiveOperationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per hour
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      error: 'Too many attempts, please try again later.',
    });
  },
});

// Rate limiting for password reset and account recovery
const accountRecoveryLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  keyGenerator: (req) => {
    // Use email if available, otherwise fall back to IP
    const ip = req.ip || req.connection.remoteAddress;
    const email = req.body?.email ? `:${req.body.email}` : '';
    return `recovery:${ip}${email}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      error: 'Too many recovery attempts, please try again later.',
    });
  },
});

// Rate limiting for API keys
const apiKeyLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour per API key
  keyGenerator: (req) => {
    // Use API key from header, query param, or body
    const apiKey = req.get('x-api-key') || req.query.apiKey || req.body.apiKey;
    return `api-key:${apiKey || 'anonymous'}`;
  },
  skip: (req) => {
    // Skip rate limiting for OPTIONS requests (CORS preflight)
    return req.method === 'OPTIONS';
  },
});

// Close Redis connection on process termination
process.on('SIGINT', async () => {
  try {
    await redisClient.quit();
  } catch (error) {
    logger.error('Error closing Redis client:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  try {
    await redisClient.quit();
  } catch (error) {
    logger.error('Error closing Redis client:', error);
  }
  process.exit(0);
});

module.exports = {
  apiLimiter,
  authLimiter,
  publicApiLimiter,
  sensitiveOperationLimiter,
  accountRecoveryLimiter,
  apiKeyLimiter,
  createRateLimiter,
};
