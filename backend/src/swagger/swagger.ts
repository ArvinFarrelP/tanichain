import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaniChain API',
      version: '1.0.0',
      description:
        'Transparent Agricultural Payment Network powered by Stellar. ' +
        'REST API for authentication, product listings, orders, payment commitments, ' +
        'escrow simulation, and Stellar Testnet transaction tracking.',
    },
    servers: [{ url: '', description: 'API base path' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts', './dist/modules/**/*.routes.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
