import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, ChannelModel, connect } from 'amqplib';
import { EventPublisherPort } from '../domain/ports/event-publisher.port';

@Injectable()
export class RabbitMqEventPublisher
  extends EventPublisherPort
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RabbitMqEventPublisher.name);
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
    this.registerConnectionHandlers();
    this.channel = await this.connection.createChannel();
    this.registerChannelHandlers(this.channel);

    await this.channel.assertExchange(this.exchange, 'topic', {
      durable: true,
    });
  }

  publish<TPayload>(topic: string, payload: TPayload): Promise<void> {
    const message = Buffer.from(JSON.stringify(payload));

    this.channel.publish(this.exchange, topic, message, {
      persistent: true,
      contentType: 'application/json',
    });

    return Promise.resolve();
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  // Sin estos listeners amqplib relanza el error como 'unhandled error event'
  // y crashea el proceso completo (p. ej. al reiniciar el broker).
  private registerConnectionHandlers(): void {
    this.connection.on('error', (error: Error) => {
      this.logger.error(`RabbitMQ connection error: ${error.message}`);
    });

    this.connection.on('close', () => {
      this.logger.warn('RabbitMQ connection closed');
    });
  }

  private registerChannelHandlers(channel: Channel): void {
    channel.on('error', (error: Error) => {
      this.logger.error(`RabbitMQ channel error: ${error.message}`);
    });

    channel.on('close', () => {
      this.logger.warn('RabbitMQ channel closed');
    });
  }
}
