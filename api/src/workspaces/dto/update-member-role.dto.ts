import { z } from 'zod';

export const updateMemberRoleSchema = z.object({
    role: z.enum(['owner', 'member', 'viewer']),
});

export type UpdateMemberRoleDto = z.infer<typeof updateMemberRoleSchema>;