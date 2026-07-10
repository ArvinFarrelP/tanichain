import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product id'),
    quantity: z.number().positive('Quantity must be greater than 0'),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
