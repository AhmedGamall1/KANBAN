import { Module } from '@nestjs/common';
import { AccessRepository } from './access.repository';

@Module({
    providers: [AccessRepository],
    exports: [AccessRepository],
})
export class AccessModule { }