import { z } from 'zod';

export const vehicleSchema = z.object({
    plateNumber: z.string().min(2, "Plate number must be at least 2 characters"),
    vehicleType: z.enum(["CAR", "MOTORCYCLE", "TRUCK", "VAN"]),
    size: z.enum(["SMALL", "MEDIUM", "LARGE"]),
    attributes: z.record(z.any()).optional()
});

export type VehicleInput = z.infer<typeof vehicleSchema>;