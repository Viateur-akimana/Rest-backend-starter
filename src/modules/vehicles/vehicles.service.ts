import prisma from '../../config/database';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { BadRequestException } from '../../exceptions/BadRequestException';
import { VehicleInput } from './vehicles.validator';

export const createVehicle = async (userId: number, data: VehicleInput) => {
  const existingVehicle = await prisma.vehicle.findUnique({
    where: { plateNumber: data.plateNumber },
  });

  if (existingVehicle) {
    throw new BadRequestException('Vehicle with this plate number already exists');
  }

  return prisma.vehicle.create({
    data: {
      ...data,
      userId,
    },
  });
};

export const getVehicles = async (
  userId: number,
  page: number = 1,
  limit: number = 10,
  search?: string,
) => {
  const skip = (page - 1) * limit;

  const where = {
    userId,
    // Just search by plateNumber for simplicity
    ...(search && {
      plateNumber: { contains: search, mode: 'insensitive' },
    }),
  };

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.vehicle.count({ where }),
  ]);

  return {
    data: vehicles,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getVehicleById = async (userId: number, vehicleId: number) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      userId,
    },
  });

  if (!vehicle) {
    throw new NotFoundException('Vehicle not found');
  }

  return vehicle;
};

export const updateVehicle = async (userId: number, vehicleId: number, data: VehicleInput) => {
  // Ensure vehicle exists and belongs to user
  await getVehicleById(userId, vehicleId);

  // Check if updating to a plate number that already exists (excluding this vehicle)
  if (data.plateNumber) {
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        plateNumber: data.plateNumber,
        id: { not: vehicleId },
      },
    });

    if (existingVehicle) {
      throw new BadRequestException('Vehicle with this plate number already exists');
    }
  }

  return prisma.vehicle.update({
    where: { id: vehicleId },
    data,
  });
};

export const deleteVehicle = async (userId: number, vehicleId: number) => {
  // Ensure vehicle exists and belongs to user
  await getVehicleById(userId, vehicleId);

  // Check if vehicle has active slot requests
  const activeRequests = await prisma.slotRequest.findFirst({
    where: {
      vehicleId,
      status: 'PENDING',
    },
  });

  if (activeRequests) {
    throw new BadRequestException('Cannot delete vehicle with active slot requests');
  }

  return prisma.vehicle.delete({
    where: { id: vehicleId },
  });
};
