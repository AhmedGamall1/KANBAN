import { z } from 'zod';

export const createBoardSchema = z.object({
    name: z.string().trim().min(1).max(80),
});

export type CreateBoardDto = z.infer<typeof createBoardSchema>;