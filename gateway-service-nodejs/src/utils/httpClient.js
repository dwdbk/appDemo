const axios = require('axios');
const { auth } = require('express-oauth2-jwt-bearer');

class HttpClient {
  constructor(baseURL, options = {}) {
    this.client = axios.create({
      baseURL,
      timeout: options.timeout || 5000,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Add request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        // Skip adding token for public endpoints
        if (options.skipAuth) {
          return config;
        }

        // Get the token from the auth header
        const authHeader = config.headers.Authorization || '';
        if (authHeader.startsWith('Bearer ')) {
          return config;
        }

        // If no token is provided, try to get it from the auth middleware
        if (config.auth && config.auth.token) {
          config.headers.Authorization = `Bearer ${config.auth.token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          return Promise.reject({
            status: error.response.status,
            message: error.response.data?.message || error.message,
            data: error.response.data,
          });
        } else if (error.request) {
          // The request was made but no response was received
          return Promise.reject({
            status: 503,
            message: 'Service Unavailable',
            details: 'The service is currently unavailable. Please try again later.',
          });
        } else {
          // Something happened in setting up the request that triggered an Error
          return Promise.reject({
            status: 500,
            message: 'Internal Server Error',
            details: error.message,
          });
        }
      }
    );
  }

  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  async post(url, data, config = {}) {
    return this.client.post(url, data, config);
  }

  async put(url, data, config = {}) {
    return this.client.put(url, data, config);
  }

  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }

  async patch(url, data, config = {}) {
    return this.client.patch(url, data, config);
  }
}

module.exports = HttpClient;
