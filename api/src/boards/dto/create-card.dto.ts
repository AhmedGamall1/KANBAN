import { z } from 'zod';

export const createCardSchema = z.object({
    columnId: z.uuid(),
    title: z.string().trim().min(1).max(200),
});

export type CreateCardDto = z.infer<typeof createCardSchema>;