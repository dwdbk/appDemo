const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const env = require('../utils/env');
const logger = require('../utils/logger');

/**
 * Security middleware to protect against common web vulnerabilities
 * @returns {Array} Array of Express middleware functions
 */
const securityMiddleware = [
  // Set security HTTP headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'https:'],
        connectSrc: ["'self'", 'https:'],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for WebSockets
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 63072000, // 2 years
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'no-referrer' },
    xssFilter: true,
  }),

  // Prevent HTTP Parameter Pollution
  hpp({
    whitelist: [
      // Add any whitelisted query parameters here
    ],
  }),

  // Data sanitization against NoSQL query injection
  mongoSanitize({
    onSanitize: ({ req, key }) => {
      logger.warn(`NoSQL Injection attempt detected: ${key}`, {
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
    },
  }),

  // Data sanitization against XSS
  xss(),

  // Rate limiting
  (req, res, next) => {
    // Skip rate limiting for health checks and static files
    if (req.path === '/health' || req.path.startsWith('/public/')) {
      return next();
    }
    
    // Apply rate limiting based on route
    let limiter;
    
    if (req.path.startsWith('/api/auth')) {
      // Stricter rate limiting for auth endpoints
      limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 20, // 20 requests per window
        message: {
          status: 429,
          error: 'Too many requests, please try again later.',
        },
        standardHeaders: true,
        legacyHeaders: false,
      });
    } else if (req.path.startsWith('/api')) {
      // Standard rate limiting for API endpoints
      limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per window
        message: {
          status: 429,
          error: 'Too many requests, please try again later.',
        },
        standardHeaders: true,
        legacyHeaders: false,
      });
    } else {
      // Default rate limiting for other routes
      limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 200, // 200 requests per window
        message: {
          status: 429,
          error: 'Too many requests, please try again later.',
        },
        standardHeaders: true,
        legacyHeaders: false,
      });
    }
    
    return limiter(req, res, next);
  },

  // Security headers
  (req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Enable XSS filtering in browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Disable browser caching for sensitive routes
    if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/me')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
    }
    
    next();
  },
];

module.exports = securityMiddleware;
