const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const onHeaders = require('on-headers');
const onFinished = require('on-finished');
const bytes = require('bytes');
const env = require('../utils/env');

// List of sensitive headers to redact
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-access-token',
  'x-refresh-token',
  'proxy-authorization',
];

// List of sensitive fields in request/response bodies to redact
const SENSITIVE_BODY_FIELDS = [
  'password',
  'newPassword',
  'currentPassword',
  'confirmPassword',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'creditCard',
  'cvv',
  'ssn',
  'socialSecurityNumber',
];

// Skip logging for these paths
const SKIP_PATHS = [
  '/health',
  '/metrics',
  '/favicon.ico',
  '/robots.txt',
  '/public/',
];

// Skip logging for these content types
const SKIP_CONTENT_TYPES = [
  'text/css',
  'application/javascript',
  'image/',
  'font/',
  'video/',
  'audio/',
];

/**
 * Redact sensitive information from an object
 * @param {Object} obj - Object to redact
 * @returns {Object} - Redacted object
 */
const redactSensitiveInfo = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const lowerKey = key.toLowerCase();
      
      // Redact sensitive fields
      if (SENSITIVE_BODY_FIELDS.some(field => field.toLowerCase() === lowerKey)) {
        result[key] = '***REDACTED***';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recursively redact nested objects
        result[key] = redactSensitiveInfo(obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
  }
  
  return result;
};

/**
 * Request logging middleware
 * Logs detailed information about incoming requests and responses
 */
const requestLogger = (req, res, next) => {
  // Skip logging for health checks, metrics, static files, etc.
  if (SKIP_PATHS.some(path => req.path.startsWith(path))) {
    return next();
  }
  
  // Skip logging for certain content types
  const contentType = req.headers['content-type'] || '';
  if (SKIP_CONTENT_TYPES.some(type => contentType.includes(type))) {
    return next();
  }

  // Capture the start time of the request
  const startTime = process.hrtime();
  const startTimeMs = Date.now();
  
  // Generate a unique request ID
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  // Add request ID to the request and response
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  // Create a context object to store request data
  const context = {
    id: requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    referrer: req.headers.referer || req.headers.referrer,
    startTime: startTimeMs,
  };
  
  // Store the context in the request for later use
  req.context = context;
  
  // Track response status code and content length
  let responseStatus = null;
  let contentLength = 0;
  
  // Override response methods to capture response data
  const originalWrite = res.write;
  const originalEnd = res.end;
  const chunks = [];
  
  // Capture response body chunks
  res.write = function (chunk, ...args) {
    if (chunk) chunks.push(Buffer.from(chunk));
    return originalWrite.call(this, chunk, ...args);
  };
  
  res.end = function (chunk, ...args) {
    if (chunk) chunks.push(Buffer.from(chunk));
    return originalEnd.call(this, chunk, ...args);
  };
  
  // Log request details
  const requestLog = {
    id: requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    referrer: req.headers.referer || req.headers.referrer,
    protocol: req.protocol,
    hostname: req.hostname,
    httpVersion: req.httpVersion,
    query: req.query && Object.keys(req.query).length > 0 ? req.query : undefined,
    params: req.params && Object.keys(req.params).length > 0 ? req.params : undefined,
    body: req.body && Object.keys(req.body).length > 0 
      ? redactSensitiveInfo(req.body) 
      : undefined,
    headers: Object.entries(req.headers).reduce((acc, [key, value]) => {
      // Redact sensitive headers
      acc[key] = SENSITIVE_HEADERS.includes(key.toLowerCase()) 
        ? '***REDACTED***' 
        : value;
      return acc;
    }, {}),
  };
  
  logger.info(`[${requestId}] ${req.method} ${req.originalUrl}`, {
    type: 'request',
    ...requestLog,
  });
  
  // Log response when headers are written
  onHeaders(res, () => {
    responseStatus = res.statusCode;
    contentLength = parseInt(res.getHeader('content-length') || '0', 10);
    
    // Log response start
    logger.debug(`[${requestId}] Response started`, {
      type: 'response:start',
      id: requestId,
      statusCode: responseStatus,
      statusMessage: res.statusMessage,
      headers: Object.entries(res.getHeaders()).reduce((acc, [key, value]) => {
        // Redact sensitive headers
        acc[key] = SENSITIVE_HEADERS.includes(key.toLowerCase()) 
          ? '***REDACTED***' 
          : value;
        return acc;
      }, {}),
    });
  });
  
  // Log response when finished
  onFinished(res, (err) => {
    const responseTime = process.hrtime(startTime);
    const responseTimeMs = (responseTime[0] * 1e3) + (responseTime[1] / 1e6);
    
    // Get response body for logging (if enabled and not too large)
    let responseBody = null;
    const contentType = res.getHeader('content-type') || '';
    const isJson = contentType.includes('application/json');
    const maxBodyLogSize = env.NODE_ENV === 'development' ? 1024 * 1024 : 1024; // 1MB in dev, 1KB in prod
    
    if (chunks.length > 0 && isJson && Buffer.concat(chunks).length <= maxBodyLogSize) {
      try {
        const body = Buffer.concat(chunks).toString('utf8');
        responseBody = JSON.parse(body);
        responseBody = redactSensitiveInfo(responseBody);
      } catch (e) {
        // If we can't parse as JSON, use the raw body (truncated)
        responseBody = Buffer.concat(chunks).toString('utf8').substring(0, 500);
      }
    }
    
    // Prepare log data
    const logData = {
      type: 'response',
      id: requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: responseStatus || res.statusCode,
      statusMessage: res.statusMessage,
      duration: responseTimeMs.toFixed(2) + 'ms',
      contentLength: bytes(contentLength),
      responseTime: responseTimeMs,
      timestamp: new Date().toISOString(),
      ...(responseBody && { body: responseBody }),
    };
    
    // Log based on status code
    if (err) {
      logger.error(`[${requestId}] ${req.method} ${req.originalUrl} ${responseStatus || 500} Error`, {
        ...logData,
        error: {
          message: err.message,
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        },
      });
    } else if (responseStatus >= 500) {
      logger.error(`[${requestId}] ${req.method} ${req.originalUrl} ${responseStatus}`, logData);
    } else if (responseStatus >= 400) {
      logger.warn(`[${requestId}] ${req.method} ${req.originalUrl} ${responseStatus}`, logData);
    } else {
      logger.info(`[${requestId}] ${req.method} ${req.originalUrl} ${responseStatus}`, logData);
    }
    
    // Log performance metrics
    if (env.NODE_ENV === 'production') {
      logger.metric({
        name: 'http_request_duration_seconds',
        type: 'histogram',
        value: responseTimeMs / 1000, // Convert to seconds
        tags: {
          method: req.method,
          route: req.route ? req.route.path : req.path,
          status_code: responseStatus || 200,
          status_class: `${Math.floor((responseStatus || 200) / 100)}xx`,
        },
      });
      
      logger.metric({
        name: 'http_requests_total',
        type: 'counter',
        value: 1,
        tags: {
          method: req.method,
          route: req.route ? req.route.path : req.path,
          status_code: responseStatus || 200,
          status_class: `${Math.floor((responseStatus || 200) / 100)}xx`,
        },
      });
    }
  });
  
  // Handle request errors
  req.on('error', (error) => {
    logger.error(`[${requestId}] Request error`, {
      type: 'request:error',
      id: requestId,
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });
  });
  
  // Handle response errors
  res.on('error', (error) => {
    const responseTime = process.hrtime(startTime);
    const responseTimeMs = (responseTime[0] * 1e3) + (responseTime[1] / 1e6);
    
    logger.error(`[${requestId}] Response error after ${responseTimeMs.toFixed(2)}ms`, {
      type: 'response:error',
      id: requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: responseStatus || 500,
      duration: responseTimeMs.toFixed(2) + 'ms',
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });
  });
  
  // Add response time header
  res.setHeader('X-Response-Time', `${Date.now() - startTimeMs}ms`);
  
  next();
};

module.exports = requestLogger;
