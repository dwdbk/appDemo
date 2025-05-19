const { auth } = require('express-oauth2-jwt-bearer');
const { keycloakConfig, authConfig } = require('../config/auth.config');

const setupAuth = (app) => {
  // JWT validation middleware
  const checkJwt = auth({
    audience: authConfig.audience,
    issuerBaseURL: authConfig.issuerBaseURL,
    tokenSigningAlg: authConfig.tokenSigningAlg,
  });

  // Public routes that don't require authentication
  const publicPaths = [
    '/health',
    '/actuator/health',
    '/actuator/info',
    '/swagger-ui/',
    '/v3/api-docs',
    '/swagger-resources',
    '/playground',
    '/playground/*',
    '/graphiql',
    '/graphiql/*',
    '/graphql',
    '/graphql/*',
    '/login',
    '/login/*',
    '/oauth2',
    '/oauth2/*',
  ];

  // Apply JWT check to all routes except public ones
  app.use((req, res, next) => {
    if (publicPaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    checkJwt(req, res, next);
  });

  // Add user info to request object
  app.use((req, res, next) => {
    if (req.auth) {
      req.user = {
        id: req.auth.sub,
        username: req.auth.preferred_username,
        email: req.auth.email,
        name: req.auth.given_name + ' ' + (req.auth.family_name || ''),
        roles: req.auth.realm_access?.roles || [],
      };
    }
    next();
  });
};

module.exports = { setupAuth };
