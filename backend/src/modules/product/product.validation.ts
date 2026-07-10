import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name is required'),
    description: z.string().optional(),
    category: z.string().optional(),
    quantity: z.number().positive('Quantity must be greater than 0'),
    unit: z.string().min(1).default('kg'),
    pricePerUnit: z.number().positive('Price must be greater than 0'),
    harvestDate: z.coerce.date().optional(),
    imageUrl: z.string().url().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    quantity: z.number().positive().optional(),
    unit: z.string().min(1).optional(),
    pricePerUnit: z.number().positive().optional(),
    harvestDate: z.coerce.date().optional(),
    imageUrl: z.string().url().optional(),
    status: z.enum(['AVAILABLE', 'SOLD_OUT', 'ARCHIVED']).optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
