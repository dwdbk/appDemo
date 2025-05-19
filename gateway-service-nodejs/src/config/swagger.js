const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const env = require('../utils/env');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Gateway Service',
    version: '1.0.0',
    description: 'API documentation for the Gateway Service',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: 'Development server',
    },
    {
      url: env.APP_URL || 'https://api.example.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token in the format: Bearer <token>',
      },
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'API key for external services',
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              status: 'error',
              message: 'Unauthorized: No token provided',
            },
          },
        },
      },
      BadRequest: {
        description: 'Invalid request data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              status: 'error',
              message: 'Validation error',
              errors: [
                {
                  field: 'email',
                  message: 'Email is required',
                },
              ],
            },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              status: 'error',
              message: 'Resource not found',
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              status: 'error',
              message: 'An unexpected error occurred',
            },
          },
        },
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['success', 'error'],
          },
          message: {
            type: 'string',
            description: 'A human-readable error message',
          },
          code: {
            type: 'string',
            description: 'Error code for programmatic handling',
            example: 'VALIDATION_ERROR',
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  description: 'The field that failed validation',
                },
                message: {
                  type: 'string',
                  description: 'Error message for the field',
                },
              },
            },
          },
          stack: {
            type: 'string',
            description: 'Stack trace (only in development)',
          },
        },
        required: ['status', 'message'],
      },
      Pagination: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            description: 'Total number of items',
            example: 100,
          },
          page: {
            type: 'integer',
            description: 'Current page number',
            example: 1,
          },
          limit: {
            type: 'integer',
            description: 'Number of items per page',
            example: 10,
          },
          pages: {
            type: 'integer',
            description: 'Total number of pages',
            example: 10,
          },
        },
      },
    },
    parameters: {
      page: {
        in: 'query',
        name: 'page',
        schema: {
          type: 'integer',
          default: 1,
          minimum: 1,
        },
        description: 'Page number',
      },
      limit: {
        in: 'query',
        name: 'limit',
        schema: {
          type: 'integer',
          default: 10,
          minimum: 1,
          maximum: 100,
        },
        description: 'Number of items per page',
      },
      sort: {
        in: 'query',
        name: 'sort',
        schema: {
          type: 'string',
          default: '-createdAt',
        },
        description: 'Sort by field. Prefix with - for descending order',
      },
      fields: {
        in: 'query',
        name: 'fields',
        schema: {
          type: 'string',
        },
        description: 'Comma-separated list of fields to include in the response',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// Options for the swagger-jsdoc
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js',
    './src/validations/*.js',
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Gateway Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true,
    persistAuthorization: true,
    defaultModelsExpandDepth: -1,
    defaultModelExpandDepth: 3,
    defaultModelRendering: 'model',
    displayRequestDuration: true,
    showExtensions: true,
    showCommonExtensions: true,
    tagsSorter: 'alpha',
    operationsSorter: 'method',
    validatorUrl: null,
  },
};

/**
 * Serve Swagger UI with custom options
 * @param {Object} app - Express app instance
 */
const setupSwagger = (app) => {
  // Serve Swagger UI
  app.use(
    '/api-docs',
    (req, res, next) => {
      // Set the server URL based on the current environment
      swaggerSpec.servers = [
        {
          url: `${req.protocol}://${req.get('host')}`,
          description: 'Current server',
        },
        ...swaggerSpec.servers,
      ];
      next();
    },
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerUiOptions)
  );

  // Serve Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Log Swagger UI URL
  console.log(`📚 API documentation available at /api-docs`);
};

module.exports = {
  swaggerSpec,
  swaggerUiOptions,
  setupSwagger,
};
