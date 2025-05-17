import { format } from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Parking Management API Documentation',
            version: '1.0.0',
            description: 'API documentation for the parking management backend',
            contact: {
                name: 'API Support',
                email: 'akimanaviateur94@gmail.com'
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
                // Auth Schemas
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
                },

                // User Schemas
                UserUpdateInput: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            example: 'Jane Doe'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'jane@example.com'
                        },
                        role: {
                            type: 'string',
                            enum: ['USER', 'ADMIN'],
                            example: 'USER'
                        }
                    }
                },
                UserPasswordUpdateInput: {
                    type: 'object',
                    required: ['currentPassword', 'newPassword'],
                    properties: {
                        currentPassword: {
                            type: 'string',
                            example: 'oldpassword'
                        },
                        newPassword: {
                            type: 'string',
                            minLength: 6,
                            example: 'newpassword123'
                        }
                    }
                },

                // Vehicle Schemas
                VehicleInput: {
                    type: 'object',
                    required: ['plateNumber', 'vehicleType', 'size'],
                    properties: {
                        plateNumber: {
                            type: 'string',
                            example: 'RAB 123A'
                        },
                        vehicleType: {
                            type: 'string',
                            enum: ['CAR', 'MOTORCYCLE', 'TRUCK', 'VAN'],
                            example: 'CAR'
                        },
                        size: {
                            type: 'string',
                            enum: ['SMALL', 'MEDIUM', 'LARGE'],
                            example: 'MEDIUM'
                        },
                        description: {
                            type: 'string',
                            example: 'Toyota Corolla 2022'
                        }
                    }
                },

                // Parking Slot Schemas
                SlotInput: {
                    type: 'object',
                    required: ['slotNumber', 'vehicleType', 'size', 'location'],
                    properties: {
                        slotNumber: {
                            type: 'string',
                            example: 'A-101'
                        },
                        vehicleType: {
                            type: 'string',
                            enum: ['CAR', 'MOTORCYCLE', 'TRUCK', 'VAN'],
                            example: 'CAR'
                        },
                        size: {
                            type: 'string',
                            enum: ['SMALL', 'MEDIUM', 'LARGE'],
                            example: 'MEDIUM'
                        },
                        location: {
                            type: 'string',
                            enum: ['NORTH', 'SOUTH', 'EAST', 'WEST'],
                            example: 'NORTH'
                        },
                        status: {
                            type: 'string',
                            enum: ['AVAILABLE', 'UNAVAILABLE'],
                            example: 'AVAILABLE'
                        }
                    }
                },
                BulkSlotInput: {
                    type: 'object',
                    required: ['count', 'startNumber', 'vehicleType', 'size', 'location'],
                    properties: {
                        count: {
                            type: 'integer',
                            minimum: 1,
                            example: 10
                        },
                        prefix: {
                            type: 'string',
                            example: 'A-'
                        },
                        startNumber: {
                            type: 'integer',
                            minimum: 1,
                            example: 101
                        },
                        vehicleType: {
                            type: 'string',
                            enum: ['CAR', 'MOTORCYCLE', 'TRUCK', 'VAN'],
                            example: 'CAR'
                        },
                        size: {
                            type: 'string',
                            enum: ['SMALL', 'MEDIUM', 'LARGE'],
                            example: 'MEDIUM'
                        },
                        location: {
                            type: 'string',
                            enum: ['NORTH', 'SOUTH', 'EAST', 'WEST'],
                            example: 'NORTH'
                        }
                    }
                },

                // Parking Request Schemas
                RequestInput: {
                    type: 'object',
                    required: ['vehicleId'],
                    properties: {
                        vehicleId: {
                            type: 'integer',
                            example: 1
                        }
                    }
                },
                UpdateRequestStatusInput: {
                    type: 'object',
                    required: ['status'],
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['APPROVED', 'REJECTED', 'PENDING'],
                            example: 'APPROVED'
                        },
                        slotId: {
                            type: 'integer',
                            example: 5
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
        './src/modules/users/*.ts',
        './src/modules/vehicles/*.ts',
        './src/modules/parking/*.ts'
    ]
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerUiMiddleware = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Parking Management API Documentation',
    customCss: '.swagger-ui .topbar { display: none }'
});