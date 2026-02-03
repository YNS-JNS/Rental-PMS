import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rental PMS API',
      version: '1.0.0',
      description: 'API Documentation for the Rental Property Management System',
      contact: {
        name: 'API Support',
        email: 'support@rental-pms.local',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // UTILISATION DE CHEMINS ABSOLUS (Plus sûr)
  apis: [
    path.join(__dirname, '../modules/**/*.routes.ts'),
    path.join(__dirname, '../config/swagger.ts'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
