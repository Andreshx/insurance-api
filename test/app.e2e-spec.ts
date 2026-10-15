import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource as TypeOrmDataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from '../src/configure-app';
import { PolicyBranch } from '../src/policies/domain/models/policy-branch.enum';
import { RatingStrategyName } from '../src/policies/domain/models/rating-strategy-name.enum';
import { PolicyStatus } from '../src/policies/domain/models/policy-status.enum';

describe('Insurance API (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: TypeOrmDataSource;

  const customerDto = {
    name: 'Andres Espinosa',
    email: 'andres@example.com',
  };

  const createPolicyDto = (customerId: string, overrides: any = {}) => ({
    customerId,
    branch: PolicyBranch.AUTO,
    ratingStrategy: RatingStrategyName.STANDARD,
    riskProfile: {},
    ...overrides,
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    dataSource = moduleFixture.get(TypeOrmDataSource);
    await app.init();

    // Limpieza de tablas entre tests para aislarlos
    await dataSource.query('TRUNCATE TABLE "policies", "customers" CASCADE');
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Customers', () => {
    it('should create a customer (POST /api/customers)', () => {
      return request(app.getHttpServer())
        .post('/api/customers')
        .send(customerDto)
        .expect(201)
        .then((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe(customerDto.name);
          expect(res.body.email).toBe(customerDto.email);
          expect(res.body.isActive).toBe(true);
          expect(res.body.createdAt).toBeDefined();
        });
    });

    it('should return 400 when customer name is too short', () => {
      return request(app.getHttpServer())
        .post('/api/customers')
        .send({ name: 'A', email: 'a@e.com' })
        .expect(400);
    });

    it('should return 400 when email is invalid', () => {
      return request(app.getHttpServer())
        .post('/api/customers')
        .send({ name: 'Andres', email: 'not-an-email' })
        .expect(400);
    });

    it('should return 409 when email already exists', async () => {
      await request(app.getHttpServer())
        .post('/api/customers')
        .send(customerDto)
        .expect(201);

      return request(app.getHttpServer())
        .post('/api/customers')
        .send(customerDto)
        .expect(409);
    });

    it('should get a customer by id (GET /api/customers/:id)', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/customers')
        .send(customerDto)
        .expect(201);

      return request(app.getHttpServer())
        .get(`/api/customers/${created.body.id}`)
        .expect(200)
        .then((res) => {
          expect(res.body.id).toBe(created.body.id);
          expect(res.body.email).toBe(customerDto.email);
        });
    });

    it('should return 404 when customer is not found', () => {
      return request(app.getHttpServer())
        .get('/api/customers/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('Policies', () => {
    let customerId: string;

    beforeEach(async () => {
      const created = await request(app.getHttpServer())
        .post('/api/customers')
        .send(customerDto)
        .expect(201);
      customerId = created.body.id;
    });

    it('should create a policy (POST /api/policies)', () => {
      return request(app.getHttpServer())
        .post('/api/policies')
        .send(createPolicyDto(customerId))
        .expect(201)
        .then((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.policyNumber).toMatch(/^POL-\d{8}-\d{6}$/);
          expect(res.body.customerId).toBe(customerId);
          expect(res.body.branch).toBe(PolicyBranch.AUTO);
          expect(res.body.ratingStrategy).toBe(RatingStrategyName.STANDARD);
          expect(res.body.status).toBe(PolicyStatus.QUOTED);
          expect(res.body.monthlyPremium).toBe(120_000);
          expect(res.body.coverage).toBeDefined();
          expect(res.body.riskProfile).toEqual({});
        });
    });

    it('should create a policy with RISK_BASED strategy and score 50', () => {
      return request(app.getHttpServer())
        .post('/api/policies')
        .send(
          createPolicyDto(customerId, {
            ratingStrategy: RatingStrategyName.RISK_BASED,
            riskProfile: { riskScore: 50 },
          }),
        )
        .expect(201)
        .then((res) => {
          // base 120_000 * (1 + 50/100) = 180_000
          expect(res.body.monthlyPremium).toBe(180_000);
          expect(res.body.status).toBe(PolicyStatus.QUOTED);
        });
    });

    it('should create a policy with LOYALTY strategy', () => {
      const currentYear = new Date().getFullYear();
      return request(app.getHttpServer())
        .post('/api/policies')
        .send(
          createPolicyDto(customerId, {
            ratingStrategy: RatingStrategyName.LOYALTY,
            riskProfile: { customerSince: currentYear - 5 },
          }),
        )
        .expect(201)
        .then((res) => {
          // base 120_000 * 0.85 = 102_000
          expect(res.body.monthlyPremium).toBe(102_000);
        });
    });

    it('should return 400 when customer does not exist', () => {
      return request(app.getHttpServer())
        .post('/api/policies')
        .send(createPolicyDto('00000000-0000-0000-0000-000000000000'))
        .expect(400);
    });

    it('should return 400 when riskScore is out of range for RISK_BASED', () => {
      return request(app.getHttpServer())
        .post('/api/policies')
        .send(
          createPolicyDto(customerId, {
            ratingStrategy: RatingStrategyName.RISK_BASED,
            riskProfile: { riskScore: 101 },
          }),
        )
        .expect(400);
    });

    it('should return 400 when customerSince is too recent for LOYALTY', () => {
      const currentYear = new Date().getFullYear();
      return request(app.getHttpServer())
        .post('/api/policies')
        .send(
          createPolicyDto(customerId, {
            ratingStrategy: RatingStrategyName.LOYALTY,
            riskProfile: { customerSince: currentYear },
          }),
        )
        .expect(400);
    });

    it('should return 400 when customerId is not a UUID', () => {
      return request(app.getHttpServer())
        .post('/api/policies')
        .send(createPolicyDto('not-a-uuid'))
        .expect(400);
    });

    it('should return 400 when branch is not supported', () => {
      return request(app.getHttpServer())
        .post('/api/policies')
        .send(createPolicyDto(customerId, { branch: 'MARINE' as any }))
        .expect(400);
    });

    it('should get a policy by id (GET /api/policies/:id)', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/policies')
        .send(createPolicyDto(customerId))
        .expect(201);

      return request(app.getHttpServer())
        .get(`/api/policies/${created.body.id}`)
        .expect(200)
        .then((res) => {
          expect(res.body.id).toBe(created.body.id);
          expect(res.body.policyNumber).toBe(created.body.policyNumber);
        });
    });

    it('should return 404 when policy is not found', () => {
      return request(app.getHttpServer())
        .get('/api/policies/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should get policies by customer (GET /api/policies/customer/:customerId)', async () => {
      await request(app.getHttpServer())
        .post('/api/policies')
        .send(createPolicyDto(customerId))
        .expect(201);
      await request(app.getHttpServer())
        .post('/api/policies')
        .send(createPolicyDto(customerId))
        .expect(201);

      return request(app.getHttpServer())
        .get(`/api/policies/customer/${customerId}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveLength(2);
          expect(res.body[0].customerId).toBe(customerId);
        });
    });

    it('should return an empty list when customer has no policies', () => {
      return request(app.getHttpServer())
        .get(`/api/policies/customer/${customerId}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual([]);
        });
    });
  });

  describe('Policy status transitions (PATCH /api/policies/:id/status)', () => {
    let policyId: string;

    beforeEach(async () => {
      const createdCustomer = await request(app.getHttpServer())
        .post('/api/customers')
        .send(customerDto)
        .expect(201);
      const createdPolicy = await request(app.getHttpServer())
        .post('/api/policies')
        .send(createPolicyDto(createdCustomer.body.id))
        .expect(201);
      policyId = createdPolicy.body.id;
    });

    it('should transition QUOTED -> ISSUED', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: PolicyStatus.ISSUED })
        .expect(200);

      expect(res.body.status).toBe(PolicyStatus.ISSUED);
    });

    it('should transition ISSUED -> ACTIVE', async () => {
      await request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: PolicyStatus.ISSUED })
        .expect(200);

      const res = await request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: PolicyStatus.ACTIVE })
        .expect(200);

      expect(res.body.status).toBe(PolicyStatus.ACTIVE);
    });

    it('should transition ACTIVE -> SUSPENDED', async () => {
      await request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: PolicyStatus.ISSUED })
        .expect(200);
      await request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: PolicyStatus.ACTIVE })
        .expect(200);

      const res = await request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: PolicyStatus.SUSPENDED })
        .expect(200);

      expect(res.body.status).toBe(PolicyStatus.SUSPENDED);
    });

    it('should transition SUSPENDED -> ACTIVE (reactivate)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: PolicyStatus.ISSUED })
        .expect(200);
      await request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: PolicyStatus.ACTIVE })
        .expect(200);
      await request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: PolicyStatus.SUSPENDED })
        .expect(200);

      const res = await request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: PolicyStatus.ACTIVE })
        .expect(200);

      expect(res.body.status).toBe(PolicyStatus.ACTIVE);
    });

    it('should transition QUOTED -> CANCELLED', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: PolicyStatus.CANCELLED })
        .expect(200);

      expect(res.body.status).toBe(PolicyStatus.CANCELLED);
    });

    it('should return 200 without event when target status equals current status', async () => {
      await request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: PolicyStatus.ISSUED })
        .expect(200);

      const res = await request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: PolicyStatus.ISSUED })
        .expect(200);

      expect(res.body.status).toBe(PolicyStatus.ISSUED);
    });

    it('should return 400 for invalid transition QUOTED -> ACTIVE', () => {
      return request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: PolicyStatus.ACTIVE })
        .expect(400);
    });

    it('should return 400 for invalid transition ACTIVE -> ISSUED', async () => {
      await request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: PolicyStatus.ISSUED })
        .expect(200);
      await request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: PolicyStatus.ACTIVE })
        .expect(200);

      return request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: PolicyStatus.ISSUED })
        .expect(400);
    });

    it('should return 404 when policy does not exist', () => {
      return request(app.getHttpServer())
        .patch('/api/policies/00000000-0000-0000-0000-000000000000/status')
        .send({ targetStatus: PolicyStatus.ISSUED })
        .expect(404);
    });

    it('should return 400 when targetStatus is not a valid enum', () => {
      return request(app.getHttpServer())
        .patch(`/api/policies/${policyId}/status`)
        .send({ targetStatus: 'EXPIRED' as any })
        .expect(400);
    });
  });

  describe('CORS', () => {
    it('should include CORS headers for localhost:5173', () => {
      return request(app.getHttpServer())
        .get('/api/')
        .set('Origin', 'http://localhost:5173')
        .expect(200)
        .then((res) => {
          expect(res.headers['access-control-allow-origin']).toBe(
            'http://localhost:5173',
          );
        });
    });
  });
});
