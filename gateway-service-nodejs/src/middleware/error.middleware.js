const createHttpError = require('http-errors');
const { logger } = require('../utils/logger');

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error occurred:', {
    error: {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      name: err.name,
      status: err.status || 500,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      // Don't log full body in production for security
      body: process.env.NODE_ENV === 'development' ? req.body : {},
    },
    user: req.user ? { id: req.user.id, email: req.user.email } : undefined,
  });

  // Handle JWT errors
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      error: 'Invalid or expired token',
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      error: 'Validation failed',
      details: err.details || err.message,
    });
  }

  // Handle HTTP errors
  if (createHttpError.isHttpError(err)) {
    const status = err.status || 500;
    const response = {
      status: 'error',
      error: err.message || 'An error occurred',
    };

    // Add validation errors if they exist
    if (err.errors) {
      response.errors = err.errors;
    }

    return res.status(status).json(response);
  }

  // Handle unexpected errors
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'An unexpected error occurred';

  res.status(status).json({
    status: 'error',
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details,
    }),
  });
};

/**
 * 404 Not Found middleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  next(createHttpError.NotFound(`Cannot ${req.method} ${req.originalUrl}`));
};

/**
 * Error wrapper for async/await
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function with error handling
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
