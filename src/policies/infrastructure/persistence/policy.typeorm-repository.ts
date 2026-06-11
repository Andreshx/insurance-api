import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyModel } from '../../domain/models/policy.model';
import { PolicyRepositoryPort } from '../../domain/ports/policy-repository.port';
import { PolicyMapper } from './policy.mapper';
import { PolicyTypeormEntity } from './policy.typeorm-entity';

@Injectable()
export class PolicyTypeormRepository extends PolicyRepositoryPort {
  constructor(
    @InjectRepository(PolicyTypeormEntity)
    private readonly repository: Repository<PolicyTypeormEntity>,
    private readonly mapper: PolicyMapper,
  ) {
    super();
  }

  async save(policy: PolicyModel): Promise<PolicyModel> {
    const entity = this.mapper.toEntity(policy);
    const savedEntity = await this.repository.save(entity);

    return this.mapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<PolicyModel | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByCustomerId(customerId: string): Promise<PolicyModel[]> {
    const entities = await this.repository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async findByPolicyNumber(policyNumber: string): Promise<PolicyModel | null> {
    const entity = await this.repository.findOne({
      where: { policyNumber },
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }
}