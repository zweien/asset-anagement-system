import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '资产管理系统 API',
      version: '1.0.0',
      description: '企业级资产录入管理系统 RESTful API 文档',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3002/api',
        description: '开发服务器',
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
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            name: { type: 'string', nullable: true },
            email: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['ADMIN', 'EDITOR', 'USER'] },
            active: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Asset: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            code: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['ACTIVE', 'IDLE', 'DAMAGED', 'SCRAPPED'] },
            categoryId: { type: 'string', nullable: true },
            data: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        FieldConfig: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            label: { type: 'string' },
            type: { type: 'string', enum: ['TEXT', 'TEXTAREA', 'NUMBER', 'DATE', 'SELECT', 'MULTISELECT'] },
            required: { type: 'boolean' },
            options: { type: 'array', items: { type: 'string' }, nullable: true },
            visible: { type: 'boolean' },
            order: { type: 'number' },
          },
        },
        OperationLog: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            action: { type: 'string', enum: ['CREATE', 'UPDATE', 'DELETE', 'IMPORT', 'EXPORT'] },
            entityType: { type: 'string' },
            entityId: { type: 'string' },
            userId: { type: 'string' },
            oldValue: { type: 'object', nullable: true },
            newValue: { type: 'object', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                data: { type: 'array', items: {} },
                total: { type: 'number' },
                page: { type: 'number' },
                pageSize: { type: 'number' },
                totalPages: { type: 'number' },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/docs/*.yaml'],
}

export const swaggerSpec = swaggerJsdoc(options)
