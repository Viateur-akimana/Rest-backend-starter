import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API documentation for the backend',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
                }
            },
            schemas: {
                RegisterInput: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com'
                        },
                        password: {
                            type: 'string',
                            minLength: 6,
                            example: 'password123'
                        },
                        name: {
                            type: 'string',
                            example: 'John Doe'
                        }
                    }
                },
                LoginInput: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com'
                        },
                        password: {
                            type: 'string',
                            example: 'password123'
                        }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        Access_token: {
                            type: 'string',
                            description: 'JWT access token'
                        },
                        user: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string'
                                },
                                email: {
                                    type: 'string'
                                },
                                name: {
                                    type: 'string'
                                }
                            }
                        }
                    }
                }, ProductInput: {
                    type: 'object',
                    required: ['name', 'price'],
                    properties: {
                        name: {
                            type: 'string',
                            minLength: 3,
                            example: 'Premium Widget'
                        },
                        description: {
                            type: 'string',
                            example: 'High-quality widget for professional use'
                        },
                        price: {
                            type: 'number',
                            minimum: 0,
                            example: 99.99
                        }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            example: 'Premium Widget'
                        },
                        description: {
                            type: 'string',
                            example: 'High-quality widget for professional use'
                        },
                        price: {
                            type: 'number',
                            example: 99.99
                        },
                        userId: {
                            type: 'integer',
                            example: 1
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2023-05-21T12:34:56Z'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2023-05-21T12:34:56Z'
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [
        './src/modules/auth/*.ts',
        './src/modules/products/*.ts'
    ]
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerUiMiddleware = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'API Documentation',
    customCss: '.swagger-ui .topbar { display: none }'
});