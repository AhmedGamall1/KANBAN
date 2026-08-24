import { z } from 'zod';

export const moveCardSchema = z.object({
    columnId: z.uuid(),
    prevCardId: z.uuid().nullable(),
    nextCardId: z.uuid().nullable(),
});

export type MoveCardDto = z.infer<typeof moveCardSchema>;