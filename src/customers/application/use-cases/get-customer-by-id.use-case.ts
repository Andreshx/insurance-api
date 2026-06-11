import { Inject, Injectable } from '@nestjs/common';
import { CustomerNotFoundException } from '../../domain/exceptions/customer-not-found.exception';
import { CustomerModel } from '../../domain/models/customer.model';
import { CustomerRepositoryPort } from '../../domain/ports/customer-repository.port';

@Injectable()
export class GetCustomerByIdUseCase {
  constructor(
    @Inject(CustomerRepositoryPort)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(id: string): Promise<CustomerModel> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new CustomerNotFoundException(id);
    }

    return customer;
  }
}