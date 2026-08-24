import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { BoardCardsController } from './board-cards.controller';
import { CardsController } from './cards.controller';
import { CardsRepository } from './cards.repository';
import { CardsService } from './cards.service';

@Module({
    imports: [AccessModule],
    controllers: [BoardCardsController, CardsController],
    providers: [CardsService, CardsRepository],
    exports: [CardsRepository],
})
export class CardsModule { }
