import {
    Body,
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../access/roles.decorator';
import { ColumnsService } from './columns.service';
import {
    updateColumnSchema,
    type UpdateColumnDto,
} from './dto/update-column.dto';
import { MemberGuard } from '../access/member.guard';
import { CurrentUser } from 'src/common/current-user.decorator';
import { type User } from 'src/users/users.repository';

@Controller('columns')
@UseGuards(MemberGuard("column"))
export class ColumnsController {
    constructor(private readonly columns: ColumnsService) { }

    @Patch(':id')
    @Roles('owner', 'member')
    async update(
        @Param('id') id: string,
        @CurrentUser() user: User,
        @Body(new ZodValidationPipe(updateColumnSchema)) dto: UpdateColumnDto,
    ) {
        return { column: await this.columns.update(id, user.id, dto) };
    }

    @Delete(':id')
    @Roles('owner', 'member')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string, @CurrentUser() user: User,
    ): Promise<void> {
        await this.columns.remove(id, user.id);
    }
}