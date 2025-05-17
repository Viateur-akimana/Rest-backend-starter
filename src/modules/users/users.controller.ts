import { Request, Response } from 'express';
import * as userService from './users.service';
import { userUpdateSchema, userPasswordUpdateSchema } from './users.validator';
import { BadRequestException } from '../../exceptions/BadRequestException';
import { ForbiddenException } from '../../exceptions/ForbiddenException';
import logger from '../../config/logger';

interface AuthenticatedRequest extends Request {
    user: {
        userId: number;
        role: string;
    };
}

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints (admin only)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or email
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;

        // Only admins can list all users
        if (authReq.user.role !== 'ADMIN') {
            throw new ForbiddenException('Admin access required');
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;

        const users = await userService.getUsers(page, limit, search);

        logger.info(`Users list retrieved by admin: ${authReq.user.userId}`);
        res.json(users);
    } catch (error) {
        logger.error(`Error retrieving users: ${error}`);
        throw error;
    }
};

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: User not found
 */
export const getUserById = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;

        // Only admins can get user details, except users can get their own details
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            throw new BadRequestException('Invalid user ID');
        }

        if (authReq.user.role !== 'ADMIN' && authReq.user.userId !== userId) {
            throw new ForbiddenException('Admin access required');
        }

        const user = await userService.getUserById(userId);

        logger.info(`User details retrieved: ${userId}`);
        res.json(user);
    } catch (error) {
        logger.error(`Error retrieving user: ${error}`);
        throw error;
    }
};

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateInput'
 *     responses:
 *       200:
 *         description: Updated user details
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: User not found
 */
export const updateUser = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            throw new BadRequestException('Invalid user ID');
        }

        const authReq = req as AuthenticatedRequest;

        // Only admins can update users (except for self-profile updates)
        if (authReq.user.role !== 'ADMIN') {
            throw new ForbiddenException('Admin access required');
        }

        const validator = userUpdateSchema.safeParse(req.body);
        if (!validator.success) {
            throw new BadRequestException('Validation error', validator.error.errors);
        }

        const updatedUser = await userService.updateUser(
            userId,
            authReq.user.userId,
            validator.data
        );

        logger.info(`User updated: ${userId}`);
        res.json(updatedUser);
    } catch (error) {
        logger.error(`Error updating user: ${error}`);
        throw error;
    }
};

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete user with active requests
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: User not found
 */
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            throw new BadRequestException('Invalid user ID');
        }

        const authReq = req as AuthenticatedRequest;

        // Only admins can delete users
        if (authReq.user.role !== 'ADMIN') {
            throw new ForbiddenException('Admin access required');
        }

        // Prevent admin from deleting themselves
        if (userId === authReq.user.userId) {
            throw new BadRequestException('Cannot delete your own account');
        }

        await userService.deleteUser(userId, authReq.user.userId);

        logger.info(`User deleted: ${userId}`);
        res.json({ success: true });
    } catch (error) {
        logger.error(`Error deleting user: ${error}`);
        throw error;
    }
};

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 */
export const getProfile = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user.userId;

        const user = await userService.getUserById(userId);

        logger.info(`User retrieved own profile: ${userId}`);
        res.json(user);
    } catch (error) {
        logger.error(`Error retrieving profile: ${error}`);
        throw error;
    }
};

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Updated profile
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user.userId;

        const { role, ...userData } = userUpdateSchema.parse(req.body);

        const updatedUser = await userService.updateUserProfile(userId, userData);

        logger.info(`User updated own profile: ${userId}`);
        res.json(updatedUser);
    } catch (error) {
        logger.error(`Error updating profile: ${error}`);
        throw error;
    }
};

/**
 * @swagger
 * /users/password:
 *   put:
 *     summary: Update current user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserPasswordUpdateInput'
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Validation error or current password incorrect
 *       401:
 *         description: Unauthorized
 */
export const updatePassword = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user.userId;

        const validator = userPasswordUpdateSchema.safeParse(req.body);
        if (!validator.success) {
            throw new BadRequestException('Validation error', validator.error.errors);
        }

        await userService.updateUserPassword(userId, validator.data);

        logger.info(`User updated password: ${userId}`);
        res.json({ success: true });
    } catch (error) {
        logger.error(`Error updating password: ${error}`);
        throw error;
    }
};