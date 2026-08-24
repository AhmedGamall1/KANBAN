import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../access/roles.decorator';
import { ColumnsService } from './columns.service';
import {
    createColumnSchema,
    type CreateColumnDto,
} from './dto/create-column.dto';
import { MemberGuard } from '../access/member.guard';
import { CurrentUser } from 'src/common/current-user.decorator';
import { type User } from 'src/users/users.repository';

@Controller('boards/:id/columns')
@UseGuards(MemberGuard('board'))
export class BoardColumnsController {
    constructor(private readonly columns: ColumnsService) { }
    @Post()
    @Roles('owner', 'member')
    async create(
        @Param('id') boardId: string,
        @CurrentUser() user: User,
        @Body(new ZodValidationPipe(createColumnSchema)) dto: CreateColumnDto,
    ) {
        return { column: await this.columns.create(boardId, user.id, dto) };
    }
}