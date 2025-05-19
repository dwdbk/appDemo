const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

/**
 * Get environment variable with type checking and default value
 * @param {string} key - Environment variable name
 * @param {*} defaultValue - Default value if not set
 * @param {string} type - Expected type ('string', 'number', 'boolean', 'array', 'object')
 * @returns {*} - Parsed environment variable value
 */
function getEnv(key, defaultValue = undefined, type = 'string') {
  let value = process.env[key];
  
  // Return default value if environment variable is not set
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }

  // Parse value based on type
  try {
    switch (type.toLowerCase()) {
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) {
          throw new Error(`Invalid number value for ${key}: ${value}`);
        }
        return num;
      
      case 'boolean':
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
        throw new Error(`Invalid boolean value for ${key}: ${value}`);
      
      case 'array':
        if (value.startsWith('[') && value.endsWith(']')) {
          try {
            return JSON.parse(value);
          } catch (e) {
            throw new Error(`Invalid JSON array value for ${key}: ${value}`);
          }
        }
        return value.split(',').map(item => item.trim());
      
      case 'object':
        try {
          return JSON.parse(value);
        } catch (e) {
          throw new Error(`Invalid JSON object value for ${key}: ${value}`);
        }
      
      case 'string':
      default:
        return value;
    }
  } catch (error) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Failed to parse environment variable ${key}: ${error.message}`);
  }
}

// Export environment variables with type checking and defaults
module.exports = {
  // Server configuration
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: getEnv('PORT', 8080, 'number'),
  APP_URL: getEnv('APP_URL', 'http://localhost:8080'),
  ALLOWED_ORIGINS: getEnv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:8080', 'array'),
  
  // Keycloak configuration
  KEYCLOAK_AUTH_SERVER_URL: getEnv('KEYCLOAK_AUTH_SERVER_URL', 'http://localhost:8085/auth'),
  KEYCLOAK_REALM: getEnv('KEYCLOAK_REALM', 'opera-realm'),
  KEYCLOAK_CLIENT_ID: getEnv('KEYCLOAK_CLIENT_ID', 'opera-gateway'),
  KEYCLOAK_CLIENT_SECRET: getEnv('KEYCLOAK_CLIENT_SECRET', 'your-client-secret'),
  
  // Service URLs
  OPERA_SERVICE_URL: getEnv('OPERA_SERVICE_URL', 'http://localhost:8081'),
  SHOWS_SERVICE_URL: getEnv('SHOWS_SERVICE_URL', 'http://localhost:8082'),
  
  // JWT configuration
  JWT_ISSUER: getEnv('JWT_ISSUER', 'http://localhost:8085/auth/realms/opera-realm'),
  JWT_AUDIENCE: getEnv('JWT_AUDIENCE', 'account'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: getEnv('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000, 'number'), // 15 minutes
  RATE_LIMIT_MAX: getEnv('RATE_LIMIT_MAX', 100, 'number'), // 100 requests per window
  
  // Logging
  LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),
  
  // Helper function to check if running in production
  isProduction: () => getEnv('NODE_ENV', 'development') === 'production',
  
  // Helper function to check if running in development
  isDevelopment: () => getEnv('NODE_ENV', 'development') === 'development',
  
  // Helper function to check if running in test
  isTest: () => getEnv('NODE_ENV', 'development') === 'test',
};
