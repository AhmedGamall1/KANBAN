import { z } from 'zod';

export const updateBoardSchema = z.object({
    name: z.string().trim().min(1).max(80),
});

export type UpdateBoardDto = z.infer<typeof updateBoardSchema>;