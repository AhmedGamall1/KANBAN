import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ColumnsRepository, type Column } from './columns.repository';
import type { CreateColumnDto } from './dto/create-column.dto';

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
}