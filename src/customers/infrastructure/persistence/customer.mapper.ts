import { Injectable } from '@nestjs/common';
import { CustomerModel } from '../../domain/models/customer.model';
import { CustomerTypeormEntity } from './customer.typeorm-entity';

@Injectable()
export class CustomerMapper {
  toDomain(entity: CustomerTypeormEntity): CustomerModel {
    return new CustomerModel(
      entity.id,
      entity.name,
      entity.email,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  toEntity(model: CustomerModel): CustomerTypeormEntity {
    const entity = new CustomerTypeormEntity();

    entity.id = model.getId();
    entity.name = model.getName();
    entity.email = model.getEmail();
    entity.isActive = model.getIsActive();
    entity.createdAt = model.getCreatedAt();
    entity.updatedAt = model.getUpdatedAt();

    return entity;
  }
}