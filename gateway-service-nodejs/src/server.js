#!/usr/bin/env node

/**
 * Server entry point
 * This file is responsible for starting the HTTP server and handling process signals
 */

const http = require('http');
const { app } = require('./app');
const logger = require('./utils/logger');
const env = require('./utils/env');

// Create HTTP server
const server = http.createServer(app);
const PORT = env.PORT || 3000;

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Start server
server.listen(PORT, () => {
  const address = server.address();
  const bind = typeof address === 'string' ? `pipe ${address}` : `port ${address.port}`;
  
  logger.info(`Server running in ${env.NODE_ENV} mode`);
  logger.info(`Listening on ${bind}`);
  logger.info(`Process ID: ${process.pid}`);
  logger.info(`Node.js version: ${process.version}`);
  
  // Log memory usage
  const used = process.memoryUsage();
  for (let key in used) {
    logger.debug(`Memory: ${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
});

// Handle graceful shutdown
const shutdown = (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  // Close the server
  server.close((err) => {
    if (err) {
      logger.error('Error during server close', err);
      process.exit(1);
    }
    
    logger.info('Server closed');
    
    // Close database connections, release resources, etc.
    // Example: await database.close();
    
    process.exit(0);
  });

  // Force close server after timeout
  setTimeout(() => {
    logger.error('Forcing server shutdown after timeout');
    process.exit(1);
  }, 10000); // 10 seconds
};

// Listen for termination signals
const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
signals.forEach((signal) => {
  process.once(signal, () => {
    logger.info(`Received ${signal}, starting graceful shutdown...`);
    shutdown(signal);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  
  // In production, you might want to gracefully shut down
  if (env.isProduction()) {
    logger.error('Unhandled rejection in production, shutting down...');
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  
  // In production, you might want to gracefully shut down
  if (env.isProduction()) {
    logger.error('Uncaught exception in production, shutting down...');
    process.exit(1);
  }
});

// Handle process exit
process.on('exit', (code) => {
  logger.info(`Process exiting with code ${code}`);
});

// Export server for testing
module.exports = { server };
