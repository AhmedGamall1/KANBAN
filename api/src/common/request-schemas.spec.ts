import { BadRequestException } from '@nestjs/common';
import { loginSchema } from '../auth/dto/login.dto';
import { signupSchema } from '../auth/dto/signup.dto';
import { createBoardSchema } from '../boards/dto/create-board.dto';
import { createCardSchema } from '../cards/dto/create-card.dto';
import { moveCardSchema } from '../cards/dto/move-card.dto';
import { updateCardSchema } from '../cards/dto/update-card.dto';
import { createColumnSchema } from '../columns/dto/create-column.dto';
import { updateColumnSchema } from '../columns/dto/update-column.dto';
import { createWorkspaceSchema } from '../workspaces/dto/create-workspace.dto';
import { updateMemberRoleSchema } from '../workspaces/dto/update-member-role.dto';
import { ZodValidationPipe } from './zod-validation.pipe';

const UUID = '01920000-0000-7000-8000-000000000000';

describe('signupSchema', () => {
    it('accepts a valid signup', () => {
        expect(
            signupSchema.safeParse({
                email: 'amira@example.com',
                password: 'correct-horse',
                name: 'Amira',
            }).success,
        ).toBe(true);
    });

    it('rejects a malformed email', () => {
        expect(
            signupSchema.safeParse({
                email: 'not-an-email',
                password: 'correct-horse',
                name: 'Amira',
            }).success,
        ).toBe(false);
    });

    it('rejects a password under eight characters', () => {
        const result = signupSchema.safeParse({
            email: 'amira@example.com',
            password: '1234567',
            name: 'Amira',
        });

        expect(result.success).toBe(false);
    });

    it('trims the name and rejects one that is only spaces', () => {
        const trimmed = signupSchema.safeParse({
            email: 'amira@example.com',
            password: 'correct-horse',
            name: '  Amira  ',
        });

        expect(trimmed.success && trimmed.data.name).toBe('Amira');

        expect(
            signupSchema.safeParse({
                email: 'amira@example.com',
                password: 'correct-horse',
                name: '   ',
            }).success,
        ).toBe(false);
    });
});

describe('loginSchema', () => {
    it('requires a non-empty password', () => {
        expect(
            loginSchema.safeParse({ email: 'amira@example.com', password: '' }).success,
        ).toBe(false);
    });

    it('does not impose the signup length rule', () => {
        expect(
            loginSchema.safeParse({ email: 'amira@example.com', password: 'old' }).success,
        ).toBe(true);
    });
});

describe('name schemas', () => {
    it('trims and bounds a workspace name', () => {
        const result = createWorkspaceSchema.safeParse({ name: '  Acme  ' });

        expect(result.success && result.data.name).toBe('Acme');
        expect(createWorkspaceSchema.safeParse({ name: '' }).success).toBe(false);
        expect(createWorkspaceSchema.safeParse({ name: 'a'.repeat(81) }).success).toBe(false);
        expect(createWorkspaceSchema.safeParse({ name: 'a'.repeat(80) }).success).toBe(true);
    });

    it('bounds a board name at eighty and a column name at sixty', () => {
        expect(createBoardSchema.safeParse({ name: 'a'.repeat(80) }).success).toBe(true);
        expect(createBoardSchema.safeParse({ name: 'a'.repeat(81) }).success).toBe(false);
        expect(createColumnSchema.safeParse({ name: 'a'.repeat(60) }).success).toBe(true);
        expect(createColumnSchema.safeParse({ name: 'a'.repeat(61) }).success).toBe(false);
    });
});

describe('createCardSchema', () => {
    it('requires a uuid column and a bounded title', () => {
        expect(createCardSchema.safeParse({ columnId: UUID, title: 'Ship it' }).success).toBe(true);
        expect(createCardSchema.safeParse({ columnId: 'nope', title: 'Ship it' }).success).toBe(false);
        expect(createCardSchema.safeParse({ columnId: UUID, title: '' }).success).toBe(false);
        expect(createCardSchema.safeParse({ columnId: UUID, title: 'a'.repeat(201) }).success).toBe(false);
    });
});

describe('updateCardSchema', () => {
    it('rejects an empty patch', () => {
        expect(updateCardSchema.safeParse({}).success).toBe(false);
    });

    it('treats an unknown field as an empty patch', () => {
        expect(updateCardSchema.safeParse({ nonsense: 1 }).success).toBe(false);
    });

    it('allows clearing nullable fields', () => {
        expect(
            updateCardSchema.safeParse({ description: null, assigneeId: null, label: null })
                .success,
        ).toBe(true);
    });

    it('rejects a label outside the enum', () => {
        expect(updateCardSchema.safeParse({ label: 'urgent' }).success).toBe(false);
    });
});

describe('updateColumnSchema', () => {
    it('requires either a name or a move', () => {
        expect(updateColumnSchema.safeParse({}).success).toBe(false);
        expect(updateColumnSchema.safeParse({ name: 'In review' }).success).toBe(true);
        expect(
            updateColumnSchema.safeParse({
                move: { prevColumnId: UUID, nextColumnId: null },
            }).success,
        ).toBe(true);
    });

    it('requires both ends of a move to be present, even when null', () => {
        expect(
            updateColumnSchema.safeParse({ move: { prevColumnId: UUID } }).success,
        ).toBe(false);
    });
});

describe('moveCardSchema', () => {
    it('accepts null neighbours but requires the keys', () => {
        expect(
            moveCardSchema.safeParse({ columnId: UUID, prevCardId: null, nextCardId: null })
                .success,
        ).toBe(true);

        expect(moveCardSchema.safeParse({ columnId: UUID, prevCardId: null }).success).toBe(false);
    });
});

describe('updateMemberRoleSchema', () => {
    it('accepts the three roles and nothing else', () => {
        for (const role of ['owner', 'member', 'viewer']) {
            expect(updateMemberRoleSchema.safeParse({ role }).success).toBe(true);
        }

        expect(updateMemberRoleSchema.safeParse({ role: 'admin' }).success).toBe(false);
    });
});

describe('ZodValidationPipe', () => {
    it('returns the parsed value, not the raw one', () => {
        const pipe = new ZodValidationPipe(createWorkspaceSchema);

        expect(pipe.transform({ name: '  Acme  ' })).toEqual({ name: 'Acme' });
    });

    it('throws a bad request carrying field errors', () => {
        const pipe = new ZodValidationPipe(createWorkspaceSchema);

        try {
            pipe.transform({ name: '' });
            throw new Error('expected the pipe to throw');
        } catch (error) {
            expect(error).toBeInstanceOf(BadRequestException);

            const response = (error as BadRequestException).getResponse() as {
                fieldErrors: Record<string, string[]>;
            };

            expect(response.fieldErrors.name).toBeDefined();
        }
    });
});
