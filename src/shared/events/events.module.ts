import { Module } from '@nestjs/common';
import { EventPublisherPort } from './domain/ports/event-publisher.port';
import { RabbitMqEventPublisher } from './infrastructure/rabbitmq-event.publisher';

@Module({
  providers: [
    {
      provide: EventPublisherPort,
      useClass: RabbitMqEventPublisher,
    },
  ],
  exports: [EventPublisherPort],
})
export class EventsModule {}