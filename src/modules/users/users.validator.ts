import { z } from 'zod';

export const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
});

export const userPasswordUpdateSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserPasswordUpdateInput = z.infer<typeof userPasswordUpdateSchema>;
