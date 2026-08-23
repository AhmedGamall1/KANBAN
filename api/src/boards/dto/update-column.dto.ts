import { z } from 'zod';

export const updateColumnSchema = z
    .object({
        name: z.string().trim().min(1).max(60).optional(),
        move: z
            .object({
                prevColumnId: z.uuid().nullable(),
                nextColumnId: z.uuid().nullable(),
            })
            .optional(),
    })
    .refine((value) => value.name !== undefined || value.move !== undefined, {
        message: 'Provide name or move',
    });

export type UpdateColumnDto = z.infer<typeof updateColumnSchema>;