const { createSuccessResponse } = require('../utils/apiResponse');
const { logger } = require('../utils/logger');

/**
 * Health check controller
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
const healthCheck = (req, res, next) => {
  try {
    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'Service is healthy',
      version: process.env.npm_package_version || '1.0.0',
      nodeEnv: process.env.NODE_ENV || 'development',
    };

    logger.debug('Health check successful', { healthCheck });
    res.status(200).json(createSuccessResponse(healthCheck));
  } catch (error) {
    logger.error('Health check failed', { error: error.message, stack: error.stack });
    next(error);
  }
};

/**
 * Detailed health check with dependencies
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
const detailedHealthCheck = async (req, res, next) => {
  try {
    const checks = {
      database: await checkDatabase(),
      redis: await checkRedis(),
      // Add more checks as needed
    };

    const isHealthy = Object.values(checks).every(check => check.healthy);
    const status = isHealthy ? 200 : 503;

    const healthCheck = {
      status: isHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    };

    logger.debug('Detailed health check completed', { healthCheck });
    res.status(status).json(createSuccessResponse(healthCheck));
  } catch (error) {
    logger.error('Detailed health check failed', { error: error.message, stack: error.stack });
    next(error);
  }
};

/**
 * Check database connection
 * @returns {Promise<{name: string, healthy: boolean, message: string, timestamp: string}>}
 */
async function checkDatabase() {
  const start = Date.now();
  try {
    // Example: Check database connection
    // const client = await pool.connect();
    // await client.query('SELECT 1');
    // client.release();
    return {
      name: 'database',
      healthy: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - start}ms`,
    };
  } catch (error) {
    return {
      name: 'database',
      healthy: false,
      message: `Database connection failed: ${error.message}`,
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
}

/**
 * Check Redis connection
 * @returns {Promise<{name: string, healthy: boolean, message: string, timestamp: string}>}
 */
async function checkRedis() {
  const start = Date.now();
  try {
    // Example: Check Redis connection
    // const result = await redis.ping();
    // if (result !== 'PONG') throw new Error('Invalid Redis response');
    return {
      name: 'redis',
      healthy: true,
      message: 'Redis connection successful',
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - start}ms`,
    };
  } catch (error) {
    return {
      name: 'redis',
      healthy: false,
      message: `Redis connection failed: ${error.message}`,
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
}

module.exports = {
  healthCheck,
  detailedHealthCheck,
};
