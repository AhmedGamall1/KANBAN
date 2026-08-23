import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
    updateMemberRoleSchema,
    type UpdateMemberRoleDto,
} from './dto/update-member-role.dto';
import { MembersService } from './members.service';
import { Roles } from '../access/roles.decorator';
import { MemberGuard } from '../access/member.guard';

@Controller('workspaces/:id/members')
@UseGuards(MemberGuard("workspace"))
export class MembersController {
    constructor(private readonly members: MembersService) { }

    @Get()
    async list(@Param('id') workspaceId: string) {
        return { members: await this.members.list(workspaceId) };
    }

    @Delete(':userId')
    @Roles('owner')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('id') workspaceId: string,
        @Param('userId') userId: string,
    ): Promise<void> {
        await this.members.remove(workspaceId, userId);
    }

    @Patch(':userId')
    @Roles('owner')
    async updateRole(
        @Param('id') workspaceId: string,
        @Param('userId') userId: string,
        @Body(new ZodValidationPipe(updateMemberRoleSchema))
        dto: UpdateMemberRoleDto,
    ) {
        return {
            member: await this.members.updateRole(workspaceId, userId, dto.role),
        };
    }
}