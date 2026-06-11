import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateCustomerUseCase } from './application/use-cases/create-customer.use-case';
import { GetCustomerByIdUseCase } from './application/use-cases/get-customer-by-id.use-case';
import { CustomerRepositoryPort } from './domain/ports/customer-repository.port';
import { CustomerController } from './infrastructure/controllers/customer.controller';
import { CustomerMapper } from './infrastructure/persistence/customer.mapper';
import { CustomerTypeormEntity } from './infrastructure/persistence/customer.typeorm-entity';
import { CustomerTypeormRepository } from './infrastructure/persistence/customer.typeorm-repository';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerTypeormEntity])],
  controllers: [CustomerController],
  providers: [
    CustomerMapper,
    CreateCustomerUseCase,
    GetCustomerByIdUseCase,
    {
      provide: CustomerRepositoryPort,
      useClass: CustomerTypeormRepository,
    },
  ],
  exports: [CustomerRepositoryPort],
})
export class CustomersModule {}