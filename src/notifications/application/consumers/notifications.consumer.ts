import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
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
    this.channel = await this.connection.createChannel();

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

    const payload = JSON.parse(message.content.toString());

    this.logger.log(
      `Notification sent to customer ${payload.customerId} for policy ${payload.policyNumber}: ${payload.oldStatus} -> ${payload.newStatus}`,
    );

    this.channel.ack(message);
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}