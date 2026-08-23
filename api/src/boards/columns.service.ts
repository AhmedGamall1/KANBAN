import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ColumnsRepository, type Column } from './columns.repository';
import type { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
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

            if (dto.move) {
                const { prevColumnId, nextColumnId } = dto.move;

                const prev = prevColumnId
                    ? await this.columns.findById(prevColumnId, tx)
                    : null;
                const next = nextColumnId
                    ? await this.columns.findById(nextColumnId, tx)
                    : null;

                if ((prevColumnId && !prev) || (nextColumnId && !next)) {
                    throw new BadRequestException('Neighbour column not found');
                }

                if (
                    (prev && prev.boardId !== column.boardId) ||
                    (next && next.boardId !== column.boardId)
                ) {
                    throw new BadRequestException('Neighbour is not on this board');
                }

                const position = await this.columns.midpointBetween(
                    prevColumnId,
                    nextColumnId,
                    tx,
                );

                await this.columns.setPosition(columnId, position, tx);
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