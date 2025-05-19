require('dotenv').config();

const keycloakConfig = {
  realm: process.env.KEYCLOAK_REALM || 'opera-realm',
  'auth-server-url': process.env.KEYCLOAK_AUTH_SERVER_URL || 'http://localhost:8085/auth',
  'ssl-required': 'external',
  resource: process.env.KEYCLOAK_CLIENT_ID || 'opera-gateway',
  'public-client': true,
  'confidential-port': 0,
  'bearer-only': true,
  'verify-token-audience': true,
  'use-resource-role-mappings': true,
  'token-endpoint': `${process.env.KEYCLOAK_AUTH_SERVER_URL || 'http://localhost:8085/auth'}/realms/${process.env.KEYCLOAK_REALM || 'opera-realm'}/protocol/openid-connect/token`,
  'auth-server-url-for-client': `${process.env.KEYCLOAK_AUTH_SERVER_URL || 'http://localhost:8085/auth'}/realms/${process.env.KEYCLOAK_REALM || 'opera-realm'}`,
};

const authConfig = {
  audience: process.env.AUTH_AUDIENCE || 'account',
  issuerBaseURL: `${process.env.KEYCLOAK_AUTH_SERVER_URL || 'http://localhost:8085/auth'}/realms/${process.env.KEYCLOAK_REALM || 'opera-realm'}`,
  tokenSigningAlg: 'RS256',
  jwksUri: `${process.env.KEYCLOAK_AUTH_SERVER_URL || 'http://localhost:8085/auth'}/realms/${process.env.KEYCLOAK_REALM || 'opera-realm'}/protocol/openid-connect/certs`,
};

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

module.exports = {
  keycloakConfig,
  authConfig,
  corsOptions,
};
