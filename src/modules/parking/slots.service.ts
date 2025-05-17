import prisma from '../../config/database';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { BadRequestException } from '../../exceptions/BadRequestException';
import { SlotInput, BulkSlotInput } from './slots.validator';

export const createSlot = async (data: SlotInput) => {
    // Check if slot with same number already exists
    const existingSlot = await prisma.parkingSlot.findUnique({
        where: { slotNumber: data.slotNumber }
    });

    if (existingSlot) {
        throw new BadRequestException('Slot with this number already exists');
    }

    return prisma.parkingSlot.create({
        data
    });
};

export const createBulkSlots = async (data: BulkSlotInput) => {
    const { count, prefix = '', startNumber, vehicleType, size, location } = data;
    const createdSlots = [];
    // Add explicit type here
    const slotNumbers: string[] = [];

    // Generate slot numbers
    for (let i = 0; i < count; i++) {
        slotNumbers.push(`${prefix}${startNumber + i}`);
    }

    // Check if any slot numbers already exist
    const existingSlots = await prisma.parkingSlot.findMany({
        where: {
            slotNumber: { in: slotNumbers }
        }
    });

    if (existingSlots.length > 0) {
        const existing = existingSlots.map(slot => slot.slotNumber).join(', ');
        throw new BadRequestException(`The following slot numbers already exist: ${existing}`);
    }

    // Create slots in a transaction
    await prisma.$transaction(async (tx) => {
        for (let i = 0; i < count; i++) {
            const slot = await tx.parkingSlot.create({
                data: {
                    slotNumber: slotNumbers[i],
                    vehicleType,
                    size,
                    location,
                    status: 'AVAILABLE'
                }
            });
            createdSlots.push(slot);
        }
    });

    return {
        count: createdSlots.length,
        message: `Successfully created ${createdSlots.length} parking slots`
    };
};

// Functions to add to your slots.service.ts file

export const getSlots = async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    onlyAvailable: boolean = false
) => {
    const skip = (page - 1) * limit;

    const where: any = {
        ...(onlyAvailable && { status: 'AVAILABLE' }),
        ...(search && {
            OR: [
                { slotNumber: { contains: search, mode: 'insensitive' } },
                // For location (enum), we can check if any location includes the search term
                {
                    location: {
                        in: ['NORTH', 'SOUTH', 'EAST', 'WEST']
                            .filter(loc =>
                                loc.toLowerCase().includes(search.toLowerCase())
                            )
                    }
                }
            ]
        })
    };

    const [slots, total] = await Promise.all([
        prisma.parkingSlot.findMany({
            where,
            skip,
            take: limit,
            orderBy: { slotNumber: 'asc' }
        }),
        prisma.parkingSlot.count({ where })
    ]);

    return {
        data: slots,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

export const getSlotById = async (slotId: number) => {
    const slot = await prisma.parkingSlot.findUnique({
        where: { id: slotId }
    });

    if (!slot) {
        throw new NotFoundException('Parking slot not found');
    }

    return slot;
};

export const updateSlot = async (slotId: number, data: SlotInput) => {
    // Ensure slot exists
    await getSlotById(slotId);

    // Check if updating to a slot number that already exists (excluding this slot)
    if (data.slotNumber) {
        const existingSlot = await prisma.parkingSlot.findFirst({
            where: {
                slotNumber: data.slotNumber,
                id: { not: slotId }
            }
        });

        if (existingSlot) {
            throw new BadRequestException('Slot with this number already exists');
        }
    }

    return prisma.parkingSlot.update({
        where: { id: slotId },
        data
    });
};

export const deleteSlot = async (slotId: number) => {
    // Ensure slot exists
    const slot = await getSlotById(slotId);

    // Check if slot is currently assigned
    if (slot.status === 'UNAVAILABLE') {
        throw new BadRequestException('Cannot delete a currently occupied parking slot');
    }

    return prisma.parkingSlot.delete({
        where: { id: slotId }
    });
};

export const findCompatibleSlot = async (vehicleType: string, vehicleSize: string) => {
    // Find an available slot that matches the vehicle type and size
    const slot = await prisma.parkingSlot.findFirst({
        where: {
            // Use type assertion to handle the enum types
            vehicleType: vehicleType as any,
            size: vehicleSize as any,
            status: 'AVAILABLE'
        }
    });

    if (!slot) {
        throw new BadRequestException(`No available parking slots for ${vehicleType} of size ${vehicleSize}`);
    }

    return slot;
};