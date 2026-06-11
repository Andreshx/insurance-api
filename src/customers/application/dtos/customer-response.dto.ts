import { ApiProperty } from '@nestjs/swagger';
import { CustomerModel } from '../../domain/models/customer.model';

export class CustomerResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromDomain(
    customer: CustomerModel,
  ): CustomerResponseDto {
    const dto = new CustomerResponseDto();

    dto.id = customer.getId();
    dto.name = customer.getName();
    dto.email = customer.getEmail();
    dto.isActive = customer.getIsActive();
    dto.createdAt = customer.getCreatedAt();
    dto.updatedAt = customer.getUpdatedAt();

    return dto;
  }
}