import { Module } from '@nestjs/common';
import { Notifier } from './notifier.service';

@Module({
    providers: [Notifier],
    exports: [Notifier],
})
export class NotificationsModule { }
