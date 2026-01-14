import { Request, Response } from 'express';
import * as vehicleService from './vehicles.service';
import { vehicleSchema } from './vehicles.validator';
import { BadRequestException } from '../../exceptions/BadRequestException';
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
 *   name: Vehicles
 *   description: Vehicle management endpoints
 */

/**
 * @swagger
 * /vehicles:
 *   post:
 *     summary: Create a new vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VehicleInput'
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
export const createVehicle = async (req: Request, res: Response) => {
  try {
    const validator = vehicleSchema.safeParse(req.body);
    if (!validator.success) {
      throw new BadRequestException('Validation error', validator.error.errors);
    }

    const authReq = req as AuthenticatedRequest;
    const vehicle = await vehicleService.createVehicle(authReq.user.userId, validator.data);

    logger.info(`Vehicle created: ${vehicle.plateNumber}`);
    res.status(201).json(vehicle);
  } catch (error) {
    logger.error(`Error creating vehicle: ${error}`);
    throw error;
  }
};

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Get all vehicles for the authenticated user
 *     tags: [Vehicles]
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
 *         description: Number of vehicles per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for plate number or vehicle type
 *     responses:
 *       200:
 *         description: List of vehicles
 *       401:
 *         description: Unauthorized
 */
export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const vehicles = await vehicleService.getVehicles(authReq.user.userId, page, limit, search);

    logger.info(`Vehicles retrieved for user: ${authReq.user.userId}`);
    res.json(vehicles);
  } catch (error) {
    logger.error(`Error retrieving vehicles: ${error}`);
    throw error;
  }
};

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     summary: Get a vehicle by ID
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle details
 *       400:
 *         description: Invalid vehicle ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Vehicle not found
 */
export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid vehicle id');
    }

    const authReq = req as AuthenticatedRequest;
    const vehicle = await vehicleService.getVehicleById(authReq.user.userId, id);

    logger.info(`Vehicle retrieved: ${id}`);
    res.json(vehicle);
  } catch (error) {
    logger.error(`Error retrieving vehicle: ${error}`);
    throw error;
  }
};

/**
 * @swagger
 * /vehicles/{id}:
 *   put:
 *     summary: Update a vehicle by ID
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vehicle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VehicleInput'
 *     responses:
 *       200:
 *         description: Updated vehicle details
 *       400:
 *         description: Validation error or invalid vehicle ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Vehicle not found
 */
export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid vehicle id');
    }

    const validator = vehicleSchema.safeParse(req.body);
    if (!validator.success) {
      throw new BadRequestException('Validation error', validator.error.errors);
    }

    const authReq = req as AuthenticatedRequest;
    const updatedVehicle = await vehicleService.updateVehicle(
      authReq.user.userId,
      id,
      validator.data,
    );

    logger.info(`Vehicle updated: ${id}`);
    res.json(updatedVehicle);
  } catch (error) {
    logger.error(`Error updating vehicle: ${error}`);
    throw error;
  }
};

/**
 * @swagger
 * /vehicles/{id}:
 *   delete:
 *     summary: Delete a vehicle by ID
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vehicle ID
 *     responses:
 *       204:
 *         description: Vehicle deleted successfully
 *       400:
 *         description: Invalid vehicle ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Vehicle not found
 */
export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid vehicle id');
    }

    const authReq = req as AuthenticatedRequest;
    await vehicleService.deleteVehicle(authReq.user.userId, id);

    logger.info(`Vehicle deleted: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting vehicle: ${error}`);
    throw error;
  }
};
