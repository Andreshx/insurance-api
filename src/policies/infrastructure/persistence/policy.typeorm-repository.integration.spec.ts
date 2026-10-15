import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { PolicyTypeormRepository } from './policy.typeorm-repository';
import { PolicyTypeormEntity } from './policy.typeorm-entity';
import { PolicyMapper } from './policy.mapper';
import { CustomerTypeormRepository } from '../../../customers/infrastructure/persistence/customer.typeorm-repository';
import { CustomerTypeormEntity } from '../../../customers/infrastructure/persistence/customer.typeorm-entity';
import { CustomerMapper } from '../../../customers/infrastructure/persistence/customer.mapper';
import { PolicyModel } from '../../../policies/domain/models/policy.model';
import { QuotedState } from '../../../policies/domain/states/quoted.state';
import { PolicyBranch } from '../../../policies/domain/models/policy-branch.enum';
import { RatingStrategyName } from '../../../policies/domain/models/rating-strategy-name.enum';
import { RiskProfile } from '../../../policies/domain/models/risk-profile.vo';
import { Coverage } from '../../../policies/domain/models/coverage.vo';
import { CustomerModel } from '../../../customers/domain/models/customer.model';

describe('PolicyTypeormRepository (integration)', () => {
  let module: TestingModule;
  let repository: PolicyTypeormRepository;
  let customerRepository: CustomerTypeormRepository;
  let dataSource: DataSource;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_NAME'),
            entities: [CustomerTypeormEntity, PolicyTypeormEntity],
            synchronize: false,
          }),
        }),
        TypeOrmModule.forFeature([CustomerTypeormEntity, PolicyTypeormEntity]),
      ],
      providers: [
        CustomerMapper,
        CustomerTypeormRepository,
        PolicyMapper,
        PolicyTypeormRepository,
      ],
    }).compile();

    repository = module.get(PolicyTypeormRepository);
    customerRepository = module.get(CustomerTypeormRepository);
    dataSource = module.get(DataSource);

    await dataSource.query('DELETE FROM "policies"');
    await dataSource.query('DELETE FROM "customers"');
  });

  afterEach(async () => {
    await dataSource.query('DELETE FROM "policies"');
    await dataSource.query('DELETE FROM "customers"');
    await module.close();
  });

  async function createCustomer(): Promise<string> {
    const customer = new CustomerModel(
      randomUUID(),
      'Andres Espinosa',
      `andres-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
      true,
      new Date('2026-01-01'),
      new Date('2026-01-01'),
    );
    return (await customerRepository.save(customer)).getId();
  }

  async function createPolicy(
    customerId: string,
    policyNumber?: string,
  ): Promise<PolicyModel> {
    const policy = new PolicyModel(
      randomUUID(),
      policyNumber ??
        `POL-20260101-${Math.floor(Math.random() * 900000 + 100000)
          .toString()
          .padStart(6, '0')}`,
      customerId,
      PolicyBranch.AUTO,
      RatingStrategyName.STANDARD,
      new QuotedState(),
      new Coverage({ coverageAmount: 80_000_000 }),
      120_000,
      new RiskProfile({}),
      new Date('2026-01-01'),
      new Date('2026-01-01'),
    );
    return repository.save(policy);
  }

  it('should save and find a policy by id', async () => {
    const customerId = await createCustomer();
    const saved = await createPolicy(customerId, 'POL-20260101-000001');

    expect(saved.getId()).toBeDefined();
    expect(saved.getPolicyNumber()).toBe('POL-20260101-000001');

    const found = await repository.findById(saved.getId());
    expect(found).not.toBeNull();
    expect(found!.getPolicyNumber()).toBe('POL-20260101-000001');
  });

  it('should find policies by customer id', async () => {
    const customerId = await createCustomer();
    const otherCustomerId = await createCustomer();

    await createPolicy(customerId);
    await createPolicy(customerId);
    await createPolicy(otherCustomerId);

    const policies = await repository.findByCustomerId(customerId);
    expect(policies).toHaveLength(2);
    expect(policies.every((p) => p.getCustomerId() === customerId)).toBe(true);
  });

  it('should return empty list when customer has no policies', async () => {
    const customerId = await createCustomer();

    const policies = await repository.findByCustomerId(customerId);
    expect(policies).toEqual([]);
  });

  it('should enforce unique policy_number constraint', async () => {
    const customerId = await createCustomer();
    await createPolicy(customerId, 'POL-20260101-000002');

    const duplicate = new PolicyModel(
      randomUUID(),
      'POL-20260101-000002', // same number
      customerId,
      PolicyBranch.LIFE,
      RatingStrategyName.STANDARD,
      new QuotedState(),
      new Coverage({ coverageAmount: 200_000_000 }),
      90_000,
      new RiskProfile({}),
      new Date('2026-01-01'),
      new Date('2026-01-01'),
    );

    await expect(repository.save(duplicate)).rejects.toThrow();
  });

  it('should update updated_at on save', async () => {
    const customerId = await createCustomer();
    const saved = await createPolicy(customerId);

    const firstUpdatedAt = saved.getUpdatedAt();

    // Wait a bit to ensure different timestamp
    await new Promise((resolve) => setTimeout(resolve, 10));

    const updated = await repository.save(saved);
    expect(updated.getUpdatedAt().getTime()).toBeGreaterThan(
      firstUpdatedAt.getTime(),
    );
  });
});
