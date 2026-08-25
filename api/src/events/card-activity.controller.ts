import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MemberGuard } from '../access/member.guard';
import { EventsService } from './events.service';

@Controller('cards/:id/activity')
@UseGuards(MemberGuard('card'))
export class CardActivityController {
    constructor(private readonly events: EventsService) { }

    @Get()
    async list(@Param('id') cardId: string) {
        return { activity: await this.events.activityForCard(cardId) };
    }
}