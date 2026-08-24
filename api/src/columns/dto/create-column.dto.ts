import { z } from 'zod';

export const createColumnSchema = z.object({
    name: z.string().trim().min(1).max(60),
});

export type CreateColumnDto = z.infer<typeof createColumnSchema>;