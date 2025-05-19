const { auth } = require('express-oauth2-jwt-bearer');
const { keycloakConfig } = require('../config/auth.config');
const axios = require('axios');

class AuthService {
  constructor() {
    this.keycloakConfig = keycloakConfig;
  }

  /**
   * Get user info from Keycloak
   * @param {string} accessToken - The access token
   * @returns {Promise<Object>} - User info
   */
  async getUserInfo(accessToken) {
    try {
      const response = await axios.get(
        `${this.keycloakConfig['auth-server-url']}/realms/${this.keycloakConfig.realm}/protocol/openid-connect/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user info from Keycloak:', error);
      throw new Error('Failed to fetch user information');
    }
  }

  /**
   * Get token from Keycloak using authorization code
   * @param {string} code - The authorization code
   * @param {string} redirectUri - The redirect URI
   * @returns {Promise<Object>} - Token response
   */
  async getToken(code, redirectUri) {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', this.keycloakConfig.resource);
      params.append('client_secret', this.keycloakConfig.credentials?.secret || '');
      params.append('code', code);
      params.append('redirect_uri', redirectUri);

      const response = await axios.post(
        `${this.keycloakConfig['auth-server-url']}/realms/${this.keycloakConfig.realm}/protocol/openid-connect/token`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting token from Keycloak:', error);
      throw new Error('Failed to get token');
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - The refresh token
   * @returns {Promise<Object>} - Token response
   */
  async refreshToken(refreshToken) {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('client_id', this.keycloakConfig.resource);
      params.append('client_secret', this.keycloakConfig.credentials?.secret || '');
      params.append('refresh_token', refreshToken);

      const response = await axios.post(
        `${this.keycloakConfig['auth-server-url']}/realms/${this.keycloakConfig.realm}/protocol/openid-connect/token`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh token');
    }
  }

  /**
   * Logout user by invalidating tokens
   * @param {string} refreshToken - The refresh token to invalidate
   * @returns {Promise<boolean>} - True if logout was successful
   */
  async logout(refreshToken) {
    try {
      const params = new URLSearchParams();
      params.append('client_id', this.keycloakConfig.resource);
      params.append('client_secret', this.keycloakConfig.credentials?.secret || '');
      params.append('refresh_token', refreshToken);

      await axios.post(
        `${this.keycloakConfig['auth-server-url']}/realms/${this.keycloakConfig.realm}/protocol/openid-connect/logout`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      throw new Error('Failed to logout');
    }
  }
}

module.exports = new AuthService();
