import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { CustomerTypeormRepository } from './customer.typeorm-repository';
import { CustomerTypeormEntity } from './customer.typeorm-entity';
import { CustomerMapper } from './customer.mapper';
import { CustomerModel } from '../../../customers/domain/models/customer.model';

describe('CustomerTypeormRepository (integration)', () => {
  let module: TestingModule;
  let repository: CustomerTypeormRepository;
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
            entities: [CustomerTypeormEntity],
            synchronize: false,
          }),
        }),
        TypeOrmModule.forFeature([CustomerTypeormEntity]),
      ],
      providers: [CustomerMapper, CustomerTypeormRepository],
    }).compile();

    repository = module.get(CustomerTypeormRepository);
    dataSource = module.get(DataSource);

    // Limpieza de la tabla antes de cada test
    await dataSource.query('DELETE FROM "customers"');
  });

  afterEach(async () => {
    await dataSource.query('DELETE FROM "customers"');
    await module.close();
  });

  function newCustomer(overrides: Partial<CustomerModel> = {}): CustomerModel {
    return new CustomerModel(
      overrides.id ?? randomUUID(),
      overrides.name ?? 'Andres Espinosa',
      overrides.email ??
        `andres-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
      overrides.isActive ?? true,
      overrides.createdAt ?? new Date('2026-01-01'),
      overrides.updatedAt ?? new Date('2026-01-01'),
    );
  }

  it('should save and find a customer by id', async () => {
    const customer = newCustomer();
    const saved = await repository.save(customer);

    expect(saved.getId()).toBeDefined();
    expect(saved.getName()).toBe(customer.getName());
    expect(saved.getEmail()).toBe(customer.getEmail());
    expect(saved.getIsActive()).toBe(true);

    const found = await repository.findById(saved.getId());
    expect(found).not.toBeNull();
    expect(found!.getEmail()).toBe(customer.getEmail());
  });

  it('should find a customer by email', async () => {
    const customer = newCustomer({ email: 'unique-find@example.com' });
    await repository.save(customer);

    const found = await repository.findByEmail('unique-find@example.com');
    expect(found).not.toBeNull();
    expect(found!.getName()).toBe('Andres Espinosa');

    const notFound = await repository.findByEmail('noexiste@example.com');
    expect(notFound).toBeNull();
  });

  it('should enforce unique email constraint', async () => {
    const customer1 = newCustomer({ email: 'unique-constraint@example.com' });
    const customer2 = newCustomer({ email: 'unique-constraint@example.com' });

    await repository.save(customer1);

    await expect(repository.save(customer2)).rejects.toThrow();
  });
});
