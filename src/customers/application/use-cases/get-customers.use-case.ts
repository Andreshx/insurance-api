import { Inject, Injectable } from '@nestjs/common';
import { CustomerModel } from '../../domain/models/customer.model';
import { CustomerRepositoryPort } from '../../domain/ports/customer-repository.port';

@Injectable()
export class GetCustomersUseCase {
  constructor(
    @Inject(CustomerRepositoryPort)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(): Promise<CustomerModel[]> {
    return this.customerRepository.findAll();
  }
}
