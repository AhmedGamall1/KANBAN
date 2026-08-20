import { Injectable } from '@nestjs/common';
import { BoardsRepository, type Board } from './boards.repository';
import type { CreateBoardDto } from './dto/create-board.dto';

@Injectable()
export class BoardsService {
    constructor(private readonly boards: BoardsRepository) { }

    listByWorkspace(workspaceId: string): Promise<Board[]> {
        return this.boards.listByWorkspace(workspaceId);
    }

    create(workspaceId: string, dto: CreateBoardDto): Promise<Board> {
        return this.boards.create({ workspaceId, name: dto.name });
    }
}