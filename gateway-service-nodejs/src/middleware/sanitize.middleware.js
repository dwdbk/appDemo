const xss = require('xss');
const { logger } = require('../utils/logger');

// XSS configuration
const xssOptions = {
  whiteList: {
    // Allow common HTML tags with safe attributes
    a: ['href', 'title', 'target', 'rel'],
    p: [],
    br: [],
    ul: [],
    ol: [],
    li: [],
    strong: [],
    em: [],
    u: [],
    blockquote: [],
    code: [],
    pre: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
  },
  stripIgnoreTag: true, // Remove all HTML not in the whitelist
  stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed'], // Strip these tags and their content
  allowProtocolRelative: false, // Don't allow protocol-relative URLs
};

// List of sensitive fields to redact in logs
const SENSITIVE_FIELDS = [
  'password',
  'newPassword',
  'currentPassword',
  'confirmPassword',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'authorization',
  'cardNumber',
  'cvv',
  'ssn',
  'creditCard',
  'creditCardNumber',
  'creditCardCvv',
  'creditCardExpiry',
];

/**
 * Sanitize input data recursively
 * @param {*} data - Data to sanitize
 * @param {Object} options - Sanitization options
 * @returns {*} - Sanitized data
 */
const sanitizeInput = (data, options = {}) => {
  const { deep = true, xssFilter = true, trim = true } = options;
  
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle strings
  if (typeof data === 'string') {
    let result = data;
    
    // Trim whitespace
    if (trim) {
      result = result.trim();
    }
    
    // Apply XSS filtering
    if (xssFilter) {
      result = xss(result, xssOptions);
    }
    
    return result;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    if (!deep) return data;
    return data.map(item => sanitizeInput(item, options));
  }
  
  // Handle plain objects
  if (typeof data === 'object' && data.constructor === Object) {
    if (!deep) return data;
    
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = sanitizeInput(value, options);
    }
    return result;
  }
  
  // Return other types as-is
  return data;
};

/**
 * Middleware to sanitize request data
 * @param {Object} options - Sanitization options
 * @returns {Function} - Express middleware function
 */
const sanitize = (options = {}) => {
  return (req, res, next) => {
    try {
      const {
        body = true,
        query = true,
        params = true,
        headers = false, // Be careful with headers to avoid breaking things
        cookies = true,
        files = true,
        deep = true,
        xssFilter = true,
        trim = true,
        logRedacted = true,
      } = options;
      
      const sanitizeOptions = { deep, xssFilter, trim };
      
      // Sanitize request data
      if (body && req.body) {
        req.originalBody = { ...req.body };
        req.body = sanitizeInput(req.body, sanitizeOptions);
      }
      
      if (query && req.query) {
        req.originalQuery = { ...req.query };
        req.query = sanitizeInput(req.query, sanitizeOptions);
      }
      
      if (params && req.params) {
        req.originalParams = { ...req.params };
        req.params = sanitizeInput(req.params, sanitizeOptions);
      }
      
      if (headers && req.headers) {
        req.originalHeaders = { ...req.headers };
        req.headers = sanitizeInput(req.headers, sanitizeOptions);
      }
      
      if (cookies && req.cookies) {
        req.originalCookies = { ...req.cookies };
        req.cookies = sanitizeInput(req.cookies, sanitizeOptions);
      }
      
      if (files && req.files) {
        req.originalFiles = Array.isArray(req.files) ? [...req.files] : { ...req.files };
        // Note: File content is not sanitized, only metadata
      }
      
      // Log redacted request data for debugging
      if (logRedacted && process.env.NODE_ENV === 'development') {
        const redacted = {};
        
        if (req.body) {
          redacted.body = redactSensitiveData(req.body);
        }
        
        if (req.query) {
          redacted.query = redactSensitiveData(req.query);
        }
        
        if (req.params) {
          redacted.params = req.params; // Usually safe to log
        }
        
        logger.debug('Sanitized request data:', {
          method: req.method,
          path: req.path,
          ...redacted,
        });
      }
      
      next();
    } catch (error) {
      logger.error('Sanitization error:', error);
      next(error);
    }
  };
};

/**
 * Redact sensitive data from an object
 * @param {Object} obj - Object to redact
 * @returns {Object} - Object with sensitive data redacted
 */
const redactSensitiveData = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const result = Array.isArray(obj) ? [...obj] : { ...obj };
  
  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const lowerKey = key.toLowerCase();
      
      // Check if the key matches any sensitive field (case insensitive)
      const isSensitive = SENSITIVE_FIELDS.some(
        field => lowerKey.includes(field.toLowerCase())
      );
      
      if (isSensitive && result[key] !== undefined && result[key] !== null) {
        result[key] = '[REDACTED]';
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        // Recursively redact nested objects
        result[key] = redactSensitiveData(result[key]);
      }
    }
  }
  
  return result;
};

module.exports = {
  sanitize,
  sanitizeInput,
  redactSensitiveData,
};
