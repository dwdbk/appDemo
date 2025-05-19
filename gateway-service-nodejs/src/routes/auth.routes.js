const express = require('express');
const router = express.Router();
const { auth } = require('express-oauth2-jwt-bearer');
const { keycloakConfig } = require('../config/auth.config');

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(200).json({ authenticated: false });
  }
  
  res.json({
    authenticated: true,
    ...req.user,
  });
});

/**
 * @swagger
 * /api/auth/login:
 *   get:
 *     summary: Initiate login with Keycloak
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Keycloak login page
 */
router.get('/login', (req, res) => {
  const authUrl = `${keycloakConfig['auth-server-url']}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth` +
    `?client_id=${keycloakConfig.resource}` +
    `&redirect_uri=${encodeURIComponent(process.env.APP_URL || 'http://localhost:8080')}/api/auth/callback` +
    '&response_type=code' +
    '&scope=openid profile email';
  
  res.redirect(authUrl);
});

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: Logout current user
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to logout page
 */
router.get('/logout', (req, res) => {
  const logoutUrl = `${keycloakConfig['auth-server-url']}/realms/${keycloakConfig.realm}/protocol/openid-connect/logout` +
    `?redirect_uri=${encodeURIComponent(process.env.APP_URL || 'http://localhost:8080')}`;
  
  res.redirect(logoutUrl);
});

/**
 * @swagger
 * /api/auth/callback:
 *   get:
 *     summary: OAuth2 callback URL
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to frontend with tokens
 */
router.get('/callback', (req, res) => {
  // This should be handled by the OAuth2 client in a real application
  res.redirect('/');
});

module.exports = router;
