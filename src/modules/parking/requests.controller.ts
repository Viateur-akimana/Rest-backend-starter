import { Request, Response } from 'express';
import { z } from 'zod';
import { BadRequestException } from '../../exceptions/BadRequestException';
import { ForbiddenException } from '../../exceptions/ForbiddenException';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as requestService from './requests.service';
import { requestSchema, updateRequestStatusSchema } from './requests.validator';
import { logger } from '../../utils/logger';
import { logAction } from '../../utils/logAction';

/**
 * @swagger
 * tags:
 *   name: Parking Requests
 *   description: Parking slot request management endpoints
 */

/**
 * @swagger
 * /parking/requests:
 *   post:
 *     summary: Create a new parking slot request
 *     tags: [Parking Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestInput'
 *     responses:
 *       201:
 *         description: Parking slot request created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
export const createRequest = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user.userId;

        const validator = requestSchema.safeParse(req.body);
        if (!validator.success) {
            throw new BadRequestException('Validation error', validator.error.errors);
        }

        const request = await requestService.createRequest(userId, validator.data);

        // Log the action
        await logAction(userId, 'REQUEST_CREATED', `Created parking request for vehicle ID: ${request.vehicleId}`);

        logger.info(`Parking request created: ${request.id} by user ${userId}`);
        res.status(201).json(request);
    } catch (error) {
        logger.error(`Error creating parking request: ${error}`);
        throw error;
    }
};

/**
 * @swagger
 * /parking/requests:
 *   get:
 *     summary: Get all parking slot requests (admin sees all, users see their own)
 *     tags: [Parking Requests]
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
 *         description: Number of requests per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for vehicle plate number or status
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: Filter by request status
 *     responses:
 *       200:
 *         description: List of parking slot requests
 *       401:
 *         description: Unauthorized
 */
export const getAllRequests = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user.userId;
        const role = authReq.user.role;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;
        const status = req.query.status as string;

        // Regular users can only see their own requests
        const userIdFilter = role === 'ADMIN' ? null : userId;

        const result = await requestService.getRequests(userIdFilter, page, limit, search, status);

        // Log the action
        await logAction(userId, 'REQUESTS_VIEWED', `Viewed parking requests list`);

        res.status(200).json(result);
    } catch (error) {
        logger.error(`Error getting parking requests: ${error}`);
        throw error;
    }
};

/**
 * @swagger
 * /parking/requests/{id}:
 *   get:
 *     summary: Get a parking slot request by ID
 *     tags: [Parking Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Parking slot request details
 *       400:
 *         description: Invalid request ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 */
export const getRequestById = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user.userId;
        const role = authReq.user.role;
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            throw new BadRequestException('Invalid request ID');
        }

        // Regular users can only see their own requests
        const userIdFilter = role === 'ADMIN' ? null : userId;

        const request = await requestService.getRequestById(id, userIdFilter);

        // Log the action
        await logAction(userId, 'REQUEST_VIEWED', `Viewed parking request ID: ${id}`);

        res.status(200).json(request);
    } catch (error) {
        logger.error(`Error getting parking request: ${error}`);
        throw error;
    }
};

/**
 * @swagger
 * /parking/requests/{id}:
 *   put:
 *     summary: Update a parking slot request by ID (user can only update their own pending requests)
 *     tags: [Parking Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestInput'
 *     responses:
 *       200:
 *         description: Updated parking slot request details
 *       400:
 *         description: Validation error or invalid request ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 */
export const updateRequest = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user.userId;
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            throw new BadRequestException('Invalid request ID');
        }

        const validator = requestSchema.safeParse(req.body);
        if (!validator.success) {
            throw new BadRequestException('Validation error', validator.error.errors);
        }

        const request = await requestService.updateRequest(id, userId, validator.data);

        // Log the action
        await logAction(userId, 'REQUEST_UPDATED', `Updated parking request ID: ${id}`);

        res.status(200).json(request);
    } catch (error) {
        logger.error(`Error updating parking request: ${error}`);
        throw error;
    }
};

/**
 * @swagger
 * /parking/requests/{id}/status:
 *   put:
 *     summary: Update a parking slot request status (Admin only)
 *     tags: [Parking Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRequestStatusInput'
 *     responses:
 *       200:
 *         description: Updated parking slot request details
 *       400:
 *         description: Validation error or invalid request ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Request not found
 */
export const updateRequestStatus = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user.userId;
        const role = authReq.user.role;
        const id = parseInt(req.params.id);

        // Only admin can approve/reject requests
        if (role !== 'ADMIN') {
            throw new ForbiddenException('Only administrators can approve or reject parking requests');
        }

        if (isNaN(id)) {
            throw new BadRequestException('Invalid request ID');
        }

        const validator = updateRequestStatusSchema.safeParse(req.body);
        if (!validator.success) {
            throw new BadRequestException('Validation error', validator.error.errors);
        }

        const request = await requestService.updateRequestStatus(id, validator.data);

        // Log the action
        await logAction(userId, 'REQUEST_STATUS_UPDATED', `Updated parking request ID: ${id} status to ${validator.data.status}`);

        res.status(200).json(request);
    } catch (error) {
        logger.error(`Error updating parking request status: ${error}`);
        throw error;
    }
};

/**
 * @swagger
 * /parking/requests/{id}:
 *   delete:
 *     summary: Delete a parking slot request by ID (user can only delete their own pending requests)
 *     tags: [Parking Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     responses:
 *       204:
 *         description: Parking slot request deleted successfully
 *       400:
 *         description: Invalid request ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 */
export const deleteRequest = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user.userId;
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            throw new BadRequestException('Invalid request ID');
        }

        await requestService.deleteRequest(id, userId);

        // Log the action
        await logAction(userId, 'REQUEST_DELETED', `Deleted parking request ID: ${id}`);

        res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting parking request: ${error}`);
        throw error;
    }
};