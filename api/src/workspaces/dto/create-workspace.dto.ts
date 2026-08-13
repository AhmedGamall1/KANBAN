import { z } from 'zod';

export const createWorkspaceSchema = z.object({
    name: z.string().trim().min(1).max(80),
});

export type CreateWorkspaceDto = z.infer<typeof createWorkspaceSchema>;