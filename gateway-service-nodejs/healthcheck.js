#!/usr/bin/env node

/**
 * Health check script for Docker
 * This script checks if the application is running and responding to HTTP requests
 */

const http = require('http');
const { env } = require('./src/utils/env');

const PORT = env.PORT || 8080;
const HOST = '0.0.0.0';
const TIMEOUT = 5000; // 5 seconds

const options = {
  hostname: HOST,
  port: PORT,
  path: '/health',
  method: 'GET',
  timeout: TIMEOUT,
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0); // Success
  } else {
    console.error(`Health check failed with status code: ${res.statusCode}`);
    process.exit(1); // Fail
  }
});

request.on('error', (err) => {
  console.error('Health check error:', err.message);
  process.exit(1); // Fail
});

request.on('timeout', () => {
  console.error('Health check timed out');
  request.destroy();
  process.exit(1); // Fail
});

request.end();
