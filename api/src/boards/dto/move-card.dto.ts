import { z } from 'zod';

export const moveCardSchema = z.object({
    columnId: z.uuid(),
    position: z.number().int().positive(),
});

export type MoveCardDto = z.infer<typeof moveCardSchema>;