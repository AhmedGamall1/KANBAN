import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardsRepository, type Board } from './boards.repository';
import type { CreateBoardDto } from './dto/create-board.dto';
import { Column, ColumnsRepository } from '../columns/columns.repository';
import { Card, CardsRepository } from '../cards/cards.repository';

@Injectable()
export class BoardsService {
    constructor(
        private readonly boards: BoardsRepository,
        private readonly columns: ColumnsRepository,
        private readonly cards: CardsRepository,
    ) { }

    listByWorkspace(workspaceId: string): Promise<Board[]> {
        return this.boards.listByWorkspace(workspaceId);
    }

    create(workspaceId: string, dto: CreateBoardDto): Promise<Board> {
        return this.boards.create({ workspaceId, name: dto.name });
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

    async rename(id: string, name: string): Promise<Board> {
        const board = await this.boards.rename(id, name);

        if (!board) {
            throw new NotFoundException('Board not found');
        }

        return board;
    }

    async remove(id: string): Promise<void> {
        if (!(await this.boards.remove(id))) {
            throw new NotFoundException('Board not found');
        }
    }


}
