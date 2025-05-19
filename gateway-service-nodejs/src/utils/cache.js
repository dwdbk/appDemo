const Redis = require('ioredis');
const { logger } = require('./logger');
const env = require('./env');

class Cache {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    if (this.client) {
      return this.client;
    }

    try {
      this.client = new Redis({
        host: env.REDIS_HOST || 'localhost',
        port: env.REDIS_PORT || 6379,
        password: env.REDIS_PASSWORD || undefined,
        retryStrategy: (times) => {
          // Reconnect after
          const delay = Math.min(times * 100, 5000);
          return delay;
        },
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            // Only reconnect when the error contains "READONLY"
            return true;
          }
          return false;
        },
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('Redis client connected');
      });

      this.client.on('error', (err) => {
        logger.error('Redis error:', err);
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('Reconnecting to Redis...');
      });

      return this.client;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<*>} - Cached value or null
   */
  async get(key) {
    if (!this.isConnected) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Error getting key ${key} from cache:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - True if successful
   */
  async set(key, value, ttl = 3600) {
    if (!this.isConnected) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error(`Error setting key ${key} in cache:`, error);
      return false;
    }
  }

  /**
   * Delete key from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - True if successful
   */
  async del(key) {
    if (!this.isConnected) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Error deleting key ${key} from cache:`, error);
      return false;
    }
  }

  /**
   * Clear all keys matching a pattern
   * @param {string} pattern - Pattern to match keys
   * @returns {Promise<boolean>} - True if successful
   */
  async clearPattern(pattern) {
    if (!this.isConnected) {
      return false;
    }

    try {
      const stream = this.client.scanStream({
        match: pattern,
        count: 100,
      });

      return new Promise((resolve, reject) => {
        const pipeline = this.client.pipeline();
        let keysToDelete = [];

        stream.on('data', (keys) => {
          if (keys.length > 0) {
            keysToDelete = [...keysToDelete, ...keys];
            pipeline.del(...keys);
          }
        });

        stream.on('end', async () => {
          if (keysToDelete.length > 0) {
            try {
              await pipeline.exec();
              logger.info(`Cleared ${keysToDelete.length} keys matching pattern: ${pattern}`);
              resolve(true);
            } catch (error) {
              logger.error('Error executing pipeline:', error);
              reject(error);
            }
          } else {
            resolve(true);
          }
        });

        stream.on('error', (error) => {
          logger.error('Error scanning keys:', error);
          reject(error);
        });
      });
    } catch (error) {
      logger.error(`Error clearing cache with pattern ${pattern}:`, error);
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  async close() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      this.client = null;
    }
  }
}

// Create a singleton instance
const cache = new Cache();

// Handle process termination
process.on('SIGINT', async () => {
  await cache.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cache.close();
  process.exit(0);
});

module.exports = cache;
