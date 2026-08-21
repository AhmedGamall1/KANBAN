import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ColumnsRepository, type Column } from './columns.repository';
import type { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
    private readonly logger = new Logger(ColumnsService.name);

    constructor(
        private readonly db: DatabaseService,
        private readonly columns: ColumnsRepository,
    ) { }

    create(boardId: string, dto: CreateColumnDto): Promise<Column> {
        return this.db.transaction(async (tx) => {
            const position = await this.columns.nextPosition(boardId, tx);

            return this.columns.create({ boardId, name: dto.name, position }, tx);
        });
    }


    async update(columnId: string, dto: UpdateColumnDto): Promise<Column> {
        return this.db.transaction(async (tx) => {
            const column = await this.columns.findById(columnId, tx);

            if (!column) {
                throw new NotFoundException('Column not found');
            }

            if (dto.position !== undefined && dto.position !== column.position) {
                const shifted = await this.columns.shiftForMove(
                    column.boardId,
                    column.position,
                    dto.position,
                    tx,
                );

                await this.columns.setPosition(columnId, dto.position, tx);

                this.logger.log(
                    `Moved 1 column, rewrote ${shifted} sibling rows`,
                );
            }

            if (dto.name !== undefined) {
                await this.columns.rename(columnId, dto.name, tx);
            }

            const updated = await this.columns.findById(columnId, tx);

            if (!updated) {
                throw new NotFoundException('Column not found');
            }

            return updated;
        });
    }

    async remove(columnId: string): Promise<void> {
        if (!(await this.columns.remove(columnId))) {
            throw new NotFoundException('Column not found');
        }
    }
}