import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardsRepository, type Board } from './boards.repository';
import type { CreateBoardDto } from './dto/create-board.dto';
import { Column, ColumnsRepository } from '../columns/columns.repository';
import { Card, CardsRepository } from '../cards/cards.repository';
import { DatabaseService } from 'src/database/database.service';
import { EventsService } from 'src/events/events.service';

@Injectable()
export class BoardsService {
    constructor(
        private readonly db: DatabaseService,
        private readonly boards: BoardsRepository,
        private readonly columns: ColumnsRepository,
        private readonly cards: CardsRepository,
        private readonly events: EventsService,
    ) { }

    create(
        workspaceId: string,
        actorId: string,
        dto: CreateBoardDto,
    ): Promise<Board> {
        return this.db.transaction(async (tx) => {
            const board = await this.boards.create(
                { workspaceId, name: dto.name },
                tx,
            );

            await this.events.record(
                { boardId: board.id, actorId, type: 'board_created', payload: { board } },
                tx,
            );

            return board;
        });
    }

    async rename(id: string, actorId: string, name: string): Promise<Board> {
        return this.db.transaction(async (tx) => {
            const board = await this.boards.rename(id, name, tx);

            if (!board) {
                throw new NotFoundException('Board not found');
            }

            await this.events.record(
                {
                    boardId: id,
                    actorId,
                    type: 'board_renamed',
                    payload: { boardId: id, name },
                },
                tx,
            );

            return board;
        });
    }

    listByWorkspace(workspaceId: string): Promise<Board[]> {
        return this.boards.listByWorkspace(workspaceId);
    }


    async getById(
        id: string,
    ): Promise<{ board: Board; columns: Column[]; cards: Card[] }> {
        const board = await this.boards.findById(id);

        if (!board) {
            throw new NotFoundException('Board not found');
        }

        return {
            board,
            columns: await this.columns.listByBoard(id),
            cards: await this.cards.listByBoard(id),
        };
    }


    async remove(id: string): Promise<void> {
        if (!(await this.boards.remove(id))) {
            throw new NotFoundException('Board not found');
        }
    }


}
