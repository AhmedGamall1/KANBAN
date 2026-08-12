import { z } from 'zod';

export const signupSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(80),
});

export type SignupDto = z.infer<typeof signupSchema>;
