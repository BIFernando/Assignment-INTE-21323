const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management System API',
      version: '1.0.0',
      description: 'REST API documentation',
    },
    servers: [
      {
        url: 'https://taskflowtms.sytes.net',
      },
      {
        url: 'http://localhost:5000',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);