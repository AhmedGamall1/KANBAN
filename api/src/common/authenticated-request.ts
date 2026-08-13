import type { Request } from 'express';
import type { User } from '../users/users.repository';

export interface AuthenticatedRequest extends Request {
    user: User;
}