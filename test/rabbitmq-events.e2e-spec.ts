import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource as TypeOrmDataSource } from 'typeorm';
import { connect, Channel } from 'amqplib';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from '../src/configure-app';
import { PolicyStatus } from '../src/policies/domain/models/policy-status.enum';

describe('RabbitMQ events (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: TypeOrmDataSource;
  let connection: any;
  let channel: Channel;

  const exchange = 'policy.events';

  let emailCounter = 0;

  function uniqueEmail(): string {
    emailCounter += 1;
    return `user${emailCounter}-${Date.now()}@example.com`;
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    dataSource = moduleFixture.get(TypeOrmDataSource);
    await app.init();

    await dataSource.query('TRUNCATE TABLE "policies", "customers" CASCADE');

    connection = await connect('amqp://admin:admin@localhost:5672');
    channel = await connection.createChannel();
    await channel.assertExchange(exchange, 'topic', { durable: true });
    const assertQueue = await channel.assertQueue('', { exclusive: true });
    const queueName = assertQueue.queue;
    await channel.bindQueue(queueName, exchange, 'policy.#');

    // Guardar queueName en el closure para usarlo en getMessage
    (channel as any)._testQueueName = queueName;

    // Purgar cualquier mensaje residual
    await channel.purgeQueue(queueName);
  });

  afterEach(async () => {
    try {
      await channel?.close();
      await connection?.close();
    } catch {
      // ignore
    }
    await app.close();
  });

  async function getMessage(timeoutMs = 5000): Promise<any> {
    const queueName = (channel as any)._testQueueName as string;
    const endTime = Date.now() + timeoutMs;

    while (Date.now() < endTime) {
      const message = await channel.get(queueName, { noAck: false });
      if (message) {
        channel.ack(message);
        return JSON.parse(message.content.toString());
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error('No message received within timeout');
  }

  async function expectNoMessage(): Promise<void> {
    const queueName = (channel as any)._testQueueName as string;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const message = await channel.get(queueName, { noAck: false });
    if (message) {
      channel.ack(message);
      throw new Error('Expected no message but received one');
    }
  }

  async function createCustomerAndPolicy(): Promise<string> {
    const customerRes = await request(app.getHttpServer())
      .post('/api/customers')
      .send({
        name: 'Andres Espinosa',
        email: uniqueEmail(),
      })
      .expect(201);
    const customerId = customerRes.body.id;

    const policyRes = await request(app.getHttpServer())
      .post('/api/policies')
      .send({
        customerId,
        branch: 'AUTO',
        ratingStrategy: 'STANDARD',
        riskProfile: {},
      })
      .expect(201);

    return policyRes.body.id;
  }

  it('should publish policy.issued when QUOTED -> ISSUED', async () => {
    const policyId = await createCustomerAndPolicy();

    await request(app.getHttpServer())
      .patch(`/api/policies/${policyId}/status`)
      .send({ targetStatus: PolicyStatus.ISSUED })
      .expect(200);

    const event = await getMessage();
    expect(event.policyId).toBe(policyId);
    expect(event.oldStatus).toBe(PolicyStatus.QUOTED);
    expect(event.newStatus).toBe(PolicyStatus.ISSUED);
    expect(event.customerId).toBeDefined();
    expect(event.branch).toBeDefined();
    expect(event.timestamp).toBeDefined();
  });

  it('should publish policy.activated when ISSUED -> ACTIVE', async () => {
    const policyId = await createCustomerAndPolicy();

    await request(app.getHttpServer())
      .patch(`/api/policies/${policyId}/status`)
      .send({ targetStatus: PolicyStatus.ISSUED })
      .expect(200);
    // Descartar el evento de QUOTED->ISSUED
    await getMessage();

    await request(app.getHttpServer())
      .patch(`/api/policies/${policyId}/status`)
      .send({ targetStatus: PolicyStatus.ACTIVE })
      .expect(200);

    const event = await getMessage();
    expect(event.policyId).toBe(policyId);
    expect(event.oldStatus).toBe(PolicyStatus.ISSUED);
    expect(event.newStatus).toBe(PolicyStatus.ACTIVE);
  });

  it('should publish policy.suspended when ACTIVE -> SUSPENDED', async () => {
    const policyId = await createCustomerAndPolicy();

    await request(app.getHttpServer())
      .patch(`/api/policies/${policyId}/status`)
      .send({ targetStatus: PolicyStatus.ISSUED })
      .expect(200);
    await getMessage(); // QUOTED->ISSUED
    await request(app.getHttpServer())
      .patch(`/api/policies/${policyId}/status`)
      .send({ targetStatus: PolicyStatus.ACTIVE })
      .expect(200);
    await getMessage(); // ISSUED->ACTIVE
    await request(app.getHttpServer())
      .patch(`/api/policies/${policyId}/status`)
      .send({ targetStatus: PolicyStatus.SUSPENDED })
      .expect(200);

    const event = await getMessage();
    expect(event.policyId).toBe(policyId);
    expect(event.oldStatus).toBe(PolicyStatus.ACTIVE);
    expect(event.newStatus).toBe(PolicyStatus.SUSPENDED);
  });

  it('should publish policy.reactivated when SUSPENDED -> ACTIVE', async () => {
    const policyId = await createCustomerAndPolicy();

    await request(app.getHttpServer())
      .patch(`/api/policies/${policyId}/status`)
      .send({ targetStatus: PolicyStatus.ISSUED })
      .expect(200);
    await getMessage(); // QUOTED->ISSUED
    await request(app.getHttpServer())
      .patch(`/api/policies/${policyId}/status`)
      .send({ targetStatus: PolicyStatus.ACTIVE })
      .expect(200);
    await getMessage(); // ISSUED->ACTIVE
    await request(app.getHttpServer())
      .patch(`/api/policies/${policyId}/status`)
      .send({ targetStatus: PolicyStatus.SUSPENDED })
      .expect(200);
    await getMessage(); // ACTIVE->SUSPENDED
    await request(app.getHttpServer())
      .patch(`/api/policies/${policyId}/status`)
      .send({ targetStatus: PolicyStatus.ACTIVE })
      .expect(200);

    const event = await getMessage();
    expect(event.policyId).toBe(policyId);
    expect(event.oldStatus).toBe(PolicyStatus.SUSPENDED);
    expect(event.newStatus).toBe(PolicyStatus.ACTIVE);
  });

  it('should publish policy.cancelled when QUOTED -> CANCELLED', async () => {
    const policyId = await createCustomerAndPolicy();

    await request(app.getHttpServer())
      .patch(`/api/policies/${policyId}/status`)
      .send({ targetStatus: PolicyStatus.CANCELLED })
      .expect(200);

    const event = await getMessage();
    expect(event.policyId).toBe(policyId);
    expect(event.oldStatus).toBe(PolicyStatus.QUOTED);
    expect(event.newStatus).toBe(PolicyStatus.CANCELLED);
  });

  it('should publish policy.cancelled when ACTIVE -> CANCELLED', async () => {
    const policyId = await createCustomerAndPolicy();

    await request(app.getHttpServer())
      .patch(`/api/policies/${policyId}/status`)
      .send({ targetStatus: PolicyStatus.ISSUED })
      .expect(200);
    await getMessage(); // QUOTED->ISSUED
    await request(app.getHttpServer())
      .patch(`/api/policies/${policyId}/status`)
      .send({ targetStatus: PolicyStatus.ACTIVE })
      .expect(200);
    await getMessage(); // ISSUED->ACTIVE
    await request(app.getHttpServer())
      .patch(`/api/policies/${policyId}/status`)
      .send({ targetStatus: PolicyStatus.CANCELLED })
      .expect(200);

    const event = await getMessage();
    expect(event.policyId).toBe(policyId);
    expect(event.oldStatus).toBe(PolicyStatus.ACTIVE);
    expect(event.newStatus).toBe(PolicyStatus.CANCELLED);
  });

  it('should NOT publish an event when target status equals current status', async () => {
    const policyId = await createCustomerAndPolicy();

    await request(app.getHttpServer())
      .patch(`/api/policies/${policyId}/status`)
      .send({ targetStatus: PolicyStatus.ISSUED })
      .expect(200);
    await getMessage(); // QUOTED->ISSUED

    // Mismo estado: no debe publicar evento
    await request(app.getHttpServer())
      .patch(`/api/policies/${policyId}/status`)
      .send({ targetStatus: PolicyStatus.ISSUED })
      .expect(200);

    await expectNoMessage();
  });

  it('should NOT publish an event for invalid transitions', async () => {
    const policyId = await createCustomerAndPolicy();

    // QUOTED -> ACTIVE es inválido
    await request(app.getHttpServer())
      .patch(`/api/policies/${policyId}/status`)
      .send({ targetStatus: PolicyStatus.ACTIVE })
      .expect(400);

    await expectNoMessage();
  });
});
