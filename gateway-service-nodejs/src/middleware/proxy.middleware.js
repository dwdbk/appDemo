const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/proxy.config');
const logger = require('../utils/logger');

/**
 * Setup API Gateway Proxies
 * @param {Object} app - Express app instance
 */
const setupProxies = (app) => {
  // Log proxy setup
  logger.info('Setting up API Gateway proxies...');
  
  // Setup proxy for each service
  Object.entries(services).forEach(([serviceName, config]) => {
    const { pathRewrite, onError, onProxyReq, onProxyRes, ...proxyConfig } = config;
    
    // Log service proxy initialization
    logger.info(`Initializing proxy for ${serviceName} -> ${proxyConfig.target}`);
    
    // Create proxy middleware
    const proxy = createProxyMiddleware({
      ...proxyConfig,
      pathRewrite: pathRewrite || {},
      on: {
        // Error handler
        error: (err, req, res) => {
          logger.error(`Proxy error for ${serviceName}:`, err);
          if (typeof onError === 'function') {
            onError(err, req, res);
          } else {
            res.status(500).json({ 
              error: 'Service unavailable',
              service: serviceName,
              message: 'The requested service is currently unavailable',
            });
          }
        },
        // Proxy request handler
        proxyReq: (proxyReq, req, res) => {
          // Log the proxy request
          logger.debug(`Proxying request: ${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
          
          // Add X-Forwarded headers
          proxyReq.setHeader('X-Forwarded-For', req.ip || req.connection.remoteAddress);
          proxyReq.setHeader('X-Forwarded-Host', req.hostname);
          proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
          
          // Call custom proxy request handler if provided
          if (typeof onProxyReq === 'function') {
            onProxyReq(proxyReq, req, res);
          }
        },
        // Proxy response handler
        proxyRes: (proxyRes, req, res) => {
          // Log the proxy response
          logger.debug(`Proxied response: ${req.method} ${req.originalUrl} -> ${proxyRes.statusCode}`);
          
          // Call custom proxy response handler if provided
          if (typeof onProxyRes === 'function') {
            onProxyRes(proxyRes, req, res);
          }
        },
      },
    });
    
    // Apply proxy to the appropriate route
    switch (serviceName) {
      case 'graphql':
        app.use('/graphql', proxy);
        app.use('/playground', proxy);
        break;
      case 'opera-service':
        app.use('/opera', proxy);
        break;
      case 'shows-service':
        app.use('/shows', proxy);
        break;
      default:
        logger.warn(`No route mapping found for service: ${serviceName}`);
    }
  });
  
  logger.info('API Gateway proxies setup completed');
};

module.exports = { setupProxies };
