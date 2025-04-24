import { z } from 'zod';

export const productSchema = z.object({
    name: z.string().min(3),
    description: z.string(),
    price: z.union([
        z.number().positive(),
        z.string().regex(/^\d+(\.\d+)?$/, "Price must be a number").transform(Number)
    ]).pipe(
        z.number().positive()
    ),
});

export type ProductInput = z.infer<typeof productSchema>;