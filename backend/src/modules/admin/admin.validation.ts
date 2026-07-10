import { z } from 'zod';

export const updateUserSchema = z.object({
  body: z.object({
    role: z.enum(['FARMER', 'BUYER', 'COOPERATIVE', 'ADMIN']).optional(),
    isActive: z.boolean().optional(),
  }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
