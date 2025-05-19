/**
 * Proxy configuration for different services
 * Each service should have the following properties:
 * - target: The target URL of the service
 * - pathRewrite: Rewrite paths (optional)
 * - changeOrigin: Change the origin of the host header to the target URL (default: true)
 * - secure: Disable SSL certificate validation (default: false)
 * - logLevel: Log level for the proxy (default: 'error')
 * - onError: Error handler function (optional)
 * - onProxyReq: Proxy request handler function (optional)
 * - onProxyRes: Proxy response handler function (optional)
 */

const env = require('../utils/env');

const services = {
  'opera-service': {
    target: env.OPERA_SERVICE_URL,
    pathRewrite: { '^/opera': '/api' },
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
    onError: (err, req, res) => {
      console.error('Error in opera-service proxy:', err);
      res.status(500).json({ error: 'Opera Service is currently unavailable' });
    },
  },
  'shows-service': {
    target: env.SHOWS_SERVICE_URL,
    pathRewrite: { '^/shows': '/api' },
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
    onError: (err, req, res) => {
      console.error('Error in shows-service proxy:', err);
      res.status(500).json({ error: 'Shows Service is currently unavailable' });
    },
  },
  'graphql': {
    target: env.OPERA_SERVICE_URL,
    pathRewrite: { '^/graphql': '/graphql' },
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
    onError: (err, req, res) => {
      console.error('Error in GraphQL proxy:', err);
      res.status(500).json({ error: 'GraphQL Service is currently unavailable' });
    },
  },
  'playground': {
    target: env.OPERA_SERVICE_URL,
    pathRewrite: { '^/playground': '/playground' },
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
    onError: (err, req, res) => {
      console.error('Error in Playground proxy:', err);
      res.status(500).json({ error: 'Playground is currently unavailable' });
    },
  },
};

// Add common proxy options
const commonOptions = {
  changeOrigin: true,
  secure: false,
  logLevel: 'error',
  xfwd: true, // Adds x-forward headers
  ws: true, // Enable WebSocket proxying
  timeout: 30000, // 30 seconds timeout
};

// Apply common options to all services
Object.values(services).forEach((service) => {
  Object.assign(service, commonOptions);
});

module.exports = services;
