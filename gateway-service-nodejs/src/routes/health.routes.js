const express = require('express');
const router = express.Router();
const { healthCheck, detailedHealthCheck } = require('../controllers/health.controller');
const { validate } = require('../middleware/validation.middleware');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the application
 *     tags: [Health]
 *     parameters:
 *       - in: query
 *         name: detailed
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to include detailed health information
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-05-19T21:30:00.000Z
 *                 uptime:
 *                   type: number
 *                   example: 123.45
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 nodeEnv:
 *                   type: string
 *                   example: development
 *       503:
 *         description: Service Unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 error:
 *                   type: string
 *                   example: Service Unavailable
 */
router.get('/health', validate('healthCheck'), (req, res, next) => {
  if (req.query.detailed) {
    return detailedHealthCheck(req, res, next);
  }
  return healthCheck(req, res, next);
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check endpoint
 *     description: Checks if the application is ready to receive traffic
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ready
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-05-19T21:30:00.000Z
 */
router.get('/health/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness check endpoint
 *     description: Checks if the application is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is live
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: live
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-05-19T21:30:00.000Z
 */
router.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'live',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
