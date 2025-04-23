import { Request, Response } from 'express';
import * as authService from './auth.service';
import { loginSchema, registerSchema } from './auth.validator';
import { BadRequestException } from '../../exceptions/BadRequestException';


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 */
export const register = async (req: Request, res: Response) => {
    const validator = registerSchema.safeParse(req.body);
    if (!validator.success) {
        throw new BadRequestException('Invalid input', validator.error.errors);
    }
    const { token, user } = await authService.register(validator.data);
    res.setHeader('Authorization', `Bearer ${token}`);
    res.status(201).json({ user });
};
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
export const login = async (req: Request, res: Response) => {
    const validator = loginSchema.safeParse(req.body);
    if (!validator.success) {
        throw new BadRequestException('Validation Errors', validator.error.errors);
    }
    const { token, user } = await authService.login(validator.data);
    res.status(200).json({ "Access_token": token, "user": user });
};