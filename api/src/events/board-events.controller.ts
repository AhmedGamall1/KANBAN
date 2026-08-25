import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { MemberGuard } from '../access/member.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { EventsService } from './events.service';

const afterSchema = z.string().regex(/^\d+$/).default('0');

@Controller('boards/:id/events')
@UseGuards(MemberGuard('board'))
export class BoardEventsController {
    constructor(private readonly events: EventsService) { }

    @Get()
    list(
        @Param('id') boardId: string,
        @Query('after', new ZodValidationPipe(afterSchema)) after: string,
    ) {
        return this.events.since(boardId, after);
    }
}