import { z } from 'zod';

export const productSchema = z.object({
    name: z.string().min(3),
    description: z.string(),
    price: z.number().positive(),
});

export type ProductInput = z.infer<typeof productSchema>;