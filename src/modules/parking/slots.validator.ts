import { z } from 'zod';

export const slotSchema = z.object({
  slotNumber: z.string().min(1, 'Slot number is required'),
  vehicleType: z.enum(['CAR', 'MOTORCYCLE', 'TRUCK', 'VAN']),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']),
  location: z.enum(['NORTH', 'SOUTH', 'EAST', 'WEST']),
  status: z.enum(['AVAILABLE', 'UNAVAILABLE']).optional(),
});

export const bulkSlotSchema = z.object({
  count: z.number().int().positive('Count must be at least 1'),
  prefix: z.string().optional(),
  startNumber: z.number().int().positive('Start number must be at least 1'),
  vehicleType: z.enum(['CAR', 'MOTORCYCLE', 'TRUCK', 'VAN']),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']),
  location: z.enum(['NORTH', 'SOUTH', 'EAST', 'WEST']),
});

export type SlotInput = z.infer<typeof slotSchema>;
export type BulkSlotInput = z.infer<typeof bulkSlotSchema>;
