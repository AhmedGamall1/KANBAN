import { z } from 'zod';

export const updateColumnSchema = z
    .object({
        name: z.string().trim().min(1).max(60).optional(),
        position: z.number().int().positive().optional(),
    })
    .refine((value) => value.name !== undefined || value.position !== undefined, {
        message: 'Provide name or position',
    });

export type UpdateColumnDto = z.infer<typeof updateColumnSchema>;