import { Module } from '@nestjs/common';
import { AuditConsumer } from './application/consumers/audit.consumer';
import { NotificationsConsumer } from './application/consumers/notifications.consumer';

@Module({
  providers: [NotificationsConsumer, AuditConsumer],
})
export class NotificationsModule {}