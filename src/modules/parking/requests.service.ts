import prisma from '../../config/database';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { BadRequestException } from '../../exceptions/BadRequestException';
import { RequestInput } from './requests.validator';
import { findCompatibleSlot } from './slots.service';
import { sendEmail } from '../../config/email';

enum RequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export const createRequest = async (userId: number, data: RequestInput) => {
    // Check if vehicle exists and belongs to user
    const vehicle = await prisma.vehicle.findFirst({
        where: {
            id: data.vehicleId,
            userId
        }
    });

    if (!vehicle) {
        throw new NotFoundException('Vehicle not found or does not belong to you');
    }

    // Check if user already has a pending request for this vehicle
    const existingRequest = await prisma.slotRequest.findFirst({
        where: {
            vehicleId: data.vehicleId,
            status: 'PENDING'
        }
    });

    if (existingRequest) {
        throw new BadRequestException('A pending request already exists for this vehicle');
    }

    // Create the request
    return prisma.slotRequest.create({
        data: {
            userId,
            vehicleId: data.vehicleId,
            status: 'PENDING'
        },
        include: {
            vehicle: true
        }
    });
};

export const getRequests = async (
    userId: number | null,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
) => {
    const skip = (page - 1) * limit;

    const where = {
        ...(userId && { userId }),
        // Convert string status to RequestStatus enum
        ...(status && { status: status as RequestStatus }),
        ...(search && {
            OR: [
                {
                    vehicle: {
                        plateNumber: { contains: search, mode: 'insensitive' }
                    }
                }
            ]
        })
    };

    const [requests, total] = await Promise.all([
        prisma.slotRequest.findMany({
            where,
            include: {
                vehicle: true,
                parkingSlot: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.slotRequest.count({ where })
    ]);

    return {
        data: requests,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

export const getRequestById = async (requestId: number, userId: number | null = null) => {
    const request = await prisma.slotRequest.findFirst({
        where: {
            id: requestId,
            ...(userId && { userId })
        },
        include: {
            vehicle: true,
            parkingSlot: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });

    if (!request) {
        throw new NotFoundException('Slot request not found');
    }

    return request;
};

export const updateRequest = async (requestId: number, userId: number, data: RequestInput) => {
    // Ensure request exists and belongs to user
    const request = await getRequestById(requestId, userId);

    // Can only update pending requests
    if (request.status !== 'PENDING') {
        throw new BadRequestException('Cannot modify requests that are already processed');
    }

    // Ensure vehicle exists and belongs to user
    const vehicle = await prisma.vehicle.findFirst({
        where: {
            id: data.vehicleId,
            userId
        }
    });

    if (!vehicle) {
        throw new NotFoundException('Vehicle not found or does not belong to you');
    }

    return prisma.slotRequest.update({
        where: { id: requestId },
        data: {
            vehicleId: data.vehicleId
        },
        include: {
            vehicle: true
        }
    });
};

export const deleteRequest = async (requestId: number, userId: number) => {
    // Ensure request exists and belongs to user
    const request = await getRequestById(requestId, userId);

    // Can only delete pending requests
    if (request.status !== 'PENDING') {
        throw new BadRequestException('Cannot delete requests that are already processed');
    }

    return prisma.slotRequest.delete({
        where: { id: requestId }
    });
};

export const approveRequest = async (requestId: number, slotId?: number) => {
    // Get the request with vehicle details
    const request = await getRequestById(requestId);

    if (request.status !== 'PENDING') {
        throw new BadRequestException('This request has already been processed');
    }

    // Get matching slot (either specified or find compatible one)
    let slot;
    if (slotId) {
        slot = await prisma.parkingSlot.findUnique({
            where: { id: slotId }
        });

        if (!slot) {
            throw new NotFoundException('Specified parking slot not found');
        }

        if (slot.status !== 'AVAILABLE') {
            throw new BadRequestException('Selected parking slot is not available');
        }

        // Check compatibility
        if (slot.vehicleType !== request.vehicle.vehicleType || slot.size !== request.vehicle.size) {
            throw new BadRequestException('Selected parking slot is not compatible with the vehicle');
        }
    } else {
        // Find a compatible slot automatically
        slot = await findCompatibleSlot(request.vehicle.vehicleType, request.vehicle.size);
    }

    // Update slot status to unavailable
    const updatedSlot = await prisma.parkingSlot.update({
        where: { id: slot.id },
        data: { status: 'UNAVAILABLE' }
    });

    // Update request with approved status and assign slot
    const updatedRequest = await prisma.slotRequest.update({
        where: { id: requestId },
        data: {
            status: 'APPROVED',
            slotId: updatedSlot.id
        },
        include: {
            vehicle: true,
            parkingSlot: true,
            user: true
        }
    });

    // Send notification email to the user
    await sendEmail(
        updatedRequest.user.email,
        'Parking Slot Request Approved',
        `Your parking request for ${updatedRequest.vehicle.plateNumber} has been approved. Slot assigned: ${updatedRequest.parkingSlot?.slotNumber}.`,
        `
    <h2>Parking Request Approved</h2>
    <p>Your parking request for vehicle <strong>${updatedRequest.vehicle.plateNumber}</strong> has been approved.</p>
    <p>Assigned parking slot: <strong>${updatedRequest.parkingSlot?.slotNumber}</strong></p>
    <p>Location: ${updatedRequest.parkingSlot?.location}</p>
    <p>Approval date: ${new Date().toLocaleString()}</p>
    `
    );

    return updatedRequest;
};

export const rejectRequest = async (requestId: number) => {
    // Get the request with user details
    const request = await getRequestById(requestId);

    if (request.status !== 'PENDING') {
        throw new BadRequestException('This request has already been processed');
    }

    // Update request with rejected status
    const updatedRequest = await prisma.slotRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
        include: {
            vehicle: true,
            user: true
        }
    });

    // Send notification email to the user
    await sendEmail(
        updatedRequest.user.email,
        'Parking Slot Request Rejected',
        `Your parking request for ${updatedRequest.vehicle.plateNumber} has been rejected.`,
        `
    <h2>Parking Request Rejected</h2>
    <p>We regret to inform you that your parking request for vehicle <strong>${updatedRequest.vehicle.plateNumber}</strong> has been rejected.</p>
    <p>Please contact the administration for more information.</p>
    <p>Date: ${new Date().toLocaleString()}</p>
    `
    );

    return updatedRequest;
};

export const updateRequestStatus = async (requestId: number, data: { status: string, slotId?: number }) => {
    const { status, slotId } = data;

    // Use existing functions based on the status
    if (status === 'APPROVED') {
        return approveRequest(requestId, slotId);
    } else if (status === 'REJECTED') {
        return rejectRequest(requestId);
    } else {
        // Handle PENDING or other statuses
        const request = await getRequestById(requestId);

        // Can only update if not already processed
        if (request.status !== 'PENDING' && status !== 'PENDING') {
            throw new BadRequestException('Cannot change status of already processed requests');
        }

        return prisma.slotRequest.update({
            where: { id: requestId },
            data: {
                // Convert string to RequestStatus enum
                status: status as RequestStatus
            },
            include: {
                vehicle: true,
                parkingSlot: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }
};