import { Request, Response } from 'express';
import { z } from 'zod';
import { BadRequestException } from '../../exceptions/BadRequestException';
import { ForbiddenException } from '../../exceptions/ForbiddenException';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import * as slotService from './slots.service';
import { slotSchema, bulkSlotSchema } from './slots.validator';
import logger from '../../config/logger';
import { logAction } from '../../utils/logAction';

/**
 * @swagger
 * tags:
 *   name: Parking Slots
 *   description: Parking slot management endpoints
 */

/**
 * @swagger
 * /parking/slots:
 *   post:
 *     summary: Create a new parking slot (Admin only)
 *     tags: [Parking Slots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SlotInput'
 *     responses:
 *       201:
 *         description: Parking slot created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
export const createSlot = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.userId;
    const role = authReq.user.role;

    // Only admin can create slots
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can create parking slots');
    }

    const validator = slotSchema.safeParse(req.body);
    if (!validator.success) {
      throw new BadRequestException('Validation error', validator.error.errors);
    }

    const slot = await slotService.createSlot(validator.data);

    // Log the action
    await logAction(userId, 'SLOT_CREATED', `Created parking slot: ${slot.slotNumber}`);

    logger.info(`Parking slot created: ${slot.id} by admin ${userId}`);
    res.status(201).json(slot);
  } catch (error) {
    logger.error(`Error creating parking slot: ${error}`);
    throw error;
  }
};

/**
 * @swagger
 * /parking/slots/bulk:
 *   post:
 *     summary: Create multiple parking slots (Admin only)
 *     tags: [Parking Slots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkSlotInput'
 *     responses:
 *       201:
 *         description: Parking slots created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
export const createBulkSlots = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.userId;
    const role = authReq.user.role;

    // Only admin can create slots
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can create parking slots');
    }

    const validator = bulkSlotSchema.safeParse(req.body);
    if (!validator.success) {
      throw new BadRequestException('Validation error', validator.error.errors);
    }

    const result = await slotService.createBulkSlots(validator.data);

    // Log the action
    await logAction(userId, 'BULK_SLOTS_CREATED', `Created ${result.count} parking slots`);

    logger.info(`Bulk parking slots created: ${result.count} by admin ${userId}`);
    res.status(201).json(result);
  } catch (error) {
    logger.error(`Error creating bulk parking slots: ${error}`);
    throw error;
  }
};

/**
 * Get all parking slots with pagination and filtering
 */
export const getSlots = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const onlyAvailable = req.query.onlyAvailable === 'true';

    const slots = await slotService.getSlots(page, limit, search, onlyAvailable);

    logger.info('Parking slots retrieved successfully');
    res.json(slots);
  } catch (error) {
    logger.error(`Error retrieving parking slots: ${error}`);
    throw error;
  }
};

/**
 * Get parking slot by ID
 */
export const getSlotById = async (req: Request, res: Response) => {
  try {
    const slotId = parseInt(req.params.id as string);
    const slot = await slotService.getSlotById(slotId);

    logger.info(`Parking slot retrieved by ID: ${slotId}`);
    res.json(slot);
  } catch (error) {
    logger.error(`Error retrieving parking slot: ${error}`);
    throw error;
  }
};

/**
 * @swagger
 * /parking/slots/{id}:
 *   put:
 *     summary: Update a parking slot by ID (Admin only)
 *     tags: [Parking Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Slot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SlotInput'
 *     responses:
 *       200:
 *         description: Updated parking slot details
 *       400:
 *         description: Validation error or invalid slot ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Parking slot not found
 */
export const updateSlot = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.userId;
    const role = authReq.user.role;
    const id = parseInt(req.params.id as string);

    // Only admin can update slots
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can update parking slots');
    }

    if (isNaN(id)) {
      throw new BadRequestException('Invalid slot ID');
    }

    const validator = slotSchema.safeParse(req.body);
    if (!validator.success) {
      throw new BadRequestException('Validation error', validator.error.errors);
    }

    const slot = await slotService.updateSlot(id, validator.data);

    // Log the action
    await logAction(userId, 'SLOT_UPDATED', `Updated parking slot: ${slot.slotNumber}`);

    res.status(200).json(slot);
  } catch (error) {
    logger.error(`Error updating parking slot: ${error}`);
    throw error;
  }
};

/**
 * @swagger
 * /parking/slots/{id}:
 *   delete:
 *     summary: Delete a parking slot by ID (Admin only)
 *     tags: [Parking Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Slot ID
 *     responses:
 *       204:
 *         description: Parking slot deleted successfully
 *       400:
 *         description: Invalid slot ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Parking slot not found
 */
export const deleteSlot = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.userId;
    const role = authReq.user.role;
    const id = parseInt(req.params.id as string);

    // Only admin can delete slots
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can delete parking slots');
    }

    if (isNaN(id)) {
      throw new BadRequestException('Invalid slot ID');
    }

    // Get slot info before deletion for logging
    const slot = await slotService.getSlotById(id);

    await slotService.deleteSlot(id);

    // Log the action
    await logAction(userId, 'SLOT_DELETED', `Deleted parking slot: ${slot.slotNumber}`);

    res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting parking slot: ${error}`);
    throw error;
  }
};
