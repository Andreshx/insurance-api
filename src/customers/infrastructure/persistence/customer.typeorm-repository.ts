import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerModel } from '../../domain/models/customer.model';
import { CustomerRepositoryPort } from '../../domain/ports/customer-repository.port';
import { CustomerMapper } from './customer.mapper';
import { CustomerTypeormEntity } from './customer.typeorm-entity';

@Injectable()
export class CustomerTypeormRepository extends CustomerRepositoryPort {
  constructor(
    @InjectRepository(CustomerTypeormEntity)
    private readonly repository: Repository<CustomerTypeormEntity>,
    private readonly mapper: CustomerMapper,
  ) {
    super();
  }

  async save(customer: CustomerModel): Promise<CustomerModel> {
    const entity = this.mapper.toEntity(customer);
    const savedEntity = await this.repository.save(entity);

    return this.mapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<CustomerModel | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<CustomerModel | null> {
    const entity = await this.repository.findOne({
      where: { email },
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }
}