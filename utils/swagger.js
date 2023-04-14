const fs = require('fs');
const swaggerJsDoc = require('swagger-jsdoc');
const { API_ROUTE } = require('./globals');
const { version } = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`));

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Learn@Home API Docs',
      version,
      description: 'The Learn@Home API Documentation',
    },
    servers: [
      {
        url: `http://127.0.0.1:3000${API_ROUTE}`,
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'All operations related to authentication.',
      },
      {
        name: 'User',
        description: 'All operations related to the user resource.',
      },
      {
        name: 'Message',
        description: 'All operations related to the message resource.',
      },
      {
        name: 'Teaching Demand',
        description: 'All operations related to the teaching demand resource.',
      },
      {
        name: 'Event',
        description: 'All operations related to the event resource.',
      },
      {
        name: 'Task',
        description: 'All operations related to the task resource.',
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
  },
  apis: [`${__dirname}/../routes/api/*.js`],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;
