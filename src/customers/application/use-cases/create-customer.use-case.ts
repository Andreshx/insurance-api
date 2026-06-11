import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EmailAlreadyExistsException } from '../../domain/exceptions/email-already-exists.exception';
import { CustomerModel } from '../../domain/models/customer.model';
import { CustomerRepositoryPort } from '../../domain/ports/customer-repository.port';
import { CreateCustomerDto } from '../dtos/create-customer.dto';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CustomerRepositoryPort)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(dto: CreateCustomerDto): Promise<CustomerModel> {
    const existingCustomer = await this.customerRepository.findByEmail(
      dto.email,
    );

    if (existingCustomer) {
      throw new EmailAlreadyExistsException(dto.email);
    }

    const now = new Date();

    const customer = new CustomerModel(
      randomUUID(),
      dto.name,
      dto.email,
      true,
      now,
      now,
    );

    return this.customerRepository.save(customer);
  }
}