import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../access/roles.decorator';
import { ColumnsService } from './columns.service';
import {
    createColumnSchema,
    type CreateColumnDto,
} from './dto/create-column.dto';
import { MemberGuard } from '../access/member.guard';

@Controller('boards/:id/columns')
@UseGuards(MemberGuard('board'))
export class BoardColumnsController {
    constructor(private readonly columns: ColumnsService) { }

    @Post()
    @Roles('owner', 'member')
    async create(
        @Param('id') boardId: string,
        @Body(new ZodValidationPipe(createColumnSchema)) dto: CreateColumnDto,
    ) {
        return { column: await this.columns.create(boardId, dto) };
    }
}