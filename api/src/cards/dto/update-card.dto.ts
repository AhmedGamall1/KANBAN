import { z } from 'zod';

export const updateCardSchema = z
    .object({
        title: z.string().trim().min(1).max(200).optional(),
        description: z.string().max(5000).nullable().optional(),
        assigneeId: z.uuid().nullable().optional(),
        label: z
            .enum(['infra', 'db', 'frontend', 'bug', 'chore'])
            .nullable()
            .optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
        message: 'Provide at least one field',
    });

export type UpdateCardDto = z.infer<typeof updateCardSchema>;