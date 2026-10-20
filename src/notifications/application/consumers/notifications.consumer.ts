import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, ChannelModel, ConsumeMessage, connect } from 'amqplib';

@Injectable()
export class NotificationsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsConsumer.name);
  private connection!: ChannelModel;
  private channel!: Channel;
  private readonly exchange = 'policy.events';
  private readonly queue = 'policy.notifications';

  constructor(private readonly configService: ConfigService) {}

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

    await this.channel.assertQueue(this.queue, {
      durable: true,
    });

    await this.channel.bindQueue(this.queue, this.exchange, 'policy.*');

    await this.channel.consume(this.queue, (message) => {
      this.handleMessage(message);
    });
  }

  private handleMessage(message: ConsumeMessage | null): void {
    if (!message) {
      return;
    }

    try {
      const payload = JSON.parse(message.content.toString()) as {
        customerId: string;
        policyNumber: string;
        oldStatus: string;
        newStatus: string;
      };

      this.logger.log(
        `Notification sent to customer ${payload.customerId} for policy ${payload.policyNumber}: ${payload.oldStatus} -> ${payload.newStatus}`,
      );

      this.channel.ack(message);
    } catch (error) {
      // Mensaje malformado: se descarta sin requeue para evitar un bucle
      // infinito de redelivery (poison message).
      this.logger.error(
        `Discarding malformed message from ${this.queue}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      this.channel.nack(message, false, false);
    }
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
