/**
 * Success response handler
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} - JSON response
 */
const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} errors - Additional error details
 * @returns {Object} - JSON response
 */
const error = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors || undefined,
  });
};

/**
 * Validation error response handler
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors
 * @param {string} message - Error message (default: 'Validation Error')
 * @returns {Object} - JSON response with 400 status code
 */
const validationError = (res, errors, message = 'Validation Error') => {
  return res.status(400).json({
    success: false,
    message,
    errors,
  });
};

/**
 * Not Found response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Resource not found')
 * @returns {Object} - JSON response with 404 status code
 */
const notFound = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    message,
  });
};

/**
 * Unauthorized response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Unauthorized')
 * @returns {Object} - JSON response with 401 status code
 */
const unauthorized = (res, message = 'Unauthorized') => {
  return res.status(401).json({
    success: false,
    message,
  });
};

/**
 * Forbidden response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Forbidden')
 * @returns {Object} - JSON response with 403 status code
 */
const forbidden = (res, message = 'Forbidden') => {
  return res.status(403).json({
    success: false,
    message,
  });
};

module.exports = {
  success,
  error,
  validationError,
  notFound,
  unauthorized,
  forbidden,
};
