import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, ChannelModel, connect } from 'amqplib';
import { EventPublisherPort } from '../domain/ports/event-publisher.port';

@Injectable()
export class RabbitMqEventPublisher
  extends EventPublisherPort
  implements OnModuleInit, OnModuleDestroy
{
  private connection!: ChannelModel;
  private channel!: Channel;
  private readonly exchange = 'policy.events';

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async onModuleInit(): Promise<void> {
    const rabbitMqUrl = this.configService.get<string>('RABBITMQ_URL');

    if (!rabbitMqUrl) {
      throw new Error('RABBITMQ_URL is required');
    }

    this.connection = await connect(rabbitMqUrl);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(this.exchange, 'topic', {
      durable: true,
    });
  }

  async publish<TPayload>(
    topic: string,
    payload: TPayload,
  ): Promise<void> {
    const message = Buffer.from(JSON.stringify(payload));

    this.channel.publish(this.exchange, topic, message, {
      persistent: true,
      contentType: 'application/json',
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}