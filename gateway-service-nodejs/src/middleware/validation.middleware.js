const { validationResult, query, param, body } = require('express-validator');
const createHttpError = require('http-errors');
const { logger } = require('../utils/logger');

/**
 * Middleware to validate request body using express-validator
 * @param {Array} validations - Array of validation chains
 * @returns {Function} - Express middleware function
 */
const validateRequest = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors for response
    const formattedErrors = errors.array().map(err => ({
      param: err.param,
      location: err.location,
      message: err.msg,
      value: err.value,
    }));

    return next(createHttpError(400, 'Validation failed', { errors: formattedErrors }));
  };
};

/**
 * Middleware to validate request query parameters
 * @param {Object} schema - Joi validation schema
 * @returns {Function} - Express middleware function
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const formattedErrors = error.details.map(detail => ({
        param: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value,
      }));
      
      return next(createHttpError(400, 'Invalid query parameters', { errors: formattedErrors }));
    }
    
    // Replace query with validated values
    req.query = value;
    next();
  };
};

/**
 * Middleware to validate request body
 * @param {Object} schema - Joi validation schema
 * @returns {Function} - Express middleware function
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const formattedErrors = error.details.map(detail => ({
        param: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value,
      }));
      
      return next(createHttpError(400, 'Invalid request body', { errors: formattedErrors }));
    }
    
    // Replace body with validated values
    req.body = value;
    next();
  };
};

/**
 * Middleware to validate request parameters
 * @param {Object} schema - Joi validation schema
 * @returns {Function} - Express middleware function
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, { abortEarly: false });
    
    if (error) {
      const formattedErrors = error.details.map(detail => ({
        param: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value,
      }));
      
      return next(createHttpError(400, 'Invalid URL parameters', { errors: formattedErrors }));
    }
    
    // Replace params with validated values
    req.params = value;
    next();
  };
};

// Validation schemas
const validationSchemas = {
  healthCheck: [
    query('detailed')
      .optional()
      .isBoolean()
      .withMessage('Detailed parameter must be a boolean')
      .toBoolean(),
  ],
};

/**
 * Validate request using a named schema
 * @param {string} schemaName - Name of the validation schema
 * @returns {Array} - Array of validation middlewares
 */
const validate = (schemaName) => {
  const schema = validationSchemas[schemaName];
  if (!schema) {
    logger.warn(`Validation schema '${schemaName}' not found`);
    return [];
  }
  return [
    ...schema,
    (req, res, next) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      const formattedErrors = errors.array().map(err => ({
        param: err.param,
        location: err.location,
        message: err.msg,
        value: err.value,
      }));

      return next(createHttpError(400, 'Validation failed', { errors: formattedErrors }));
    },
  ];
};

module.exports = {
  validate,
  validateQuery,
  validateBody,
  validateParams,
  validateRequest,
  validationSchemas,
};
