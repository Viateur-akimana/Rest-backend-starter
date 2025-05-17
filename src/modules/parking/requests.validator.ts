import { z } from 'zod';

export const requestSchema = z.object({
    vehicleId: z.number().int().positive("Vehicle ID is required")
});

export const updateRequestStatusSchema = z.object({
    status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
    slotId: z.number().int().positive().optional()
});

export type RequestInput = z.infer<typeof requestSchema>;
export type UpdateRequestStatusInput = z.infer<typeof updateRequestStatusSchema>;