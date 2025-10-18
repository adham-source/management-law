
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'توثيق API نظام إدارة مكاتب المحاماة',
      version: '1.0.0',
      description: 'واجهة برمجة تطبيقات شاملة لإدارة مكاتب المحاماة، تم بناؤها باستخدام Gemini. تشمل إدارة العملاء، القضايا، المهام، الفواتير، والمزيد.',
      contact: {
        name: 'Adham',
        email: 'info@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'خادم التطوير المحلي',
      },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        }
    },
    security: [{
        bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.ts'], // المسارات التي تحتوي على التوثيق
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
