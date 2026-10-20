import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { QueryFailedError } from 'typeorm';
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
    const email = dto.email.trim().toLowerCase();

    const existingCustomer = await this.customerRepository.findByEmail(email);

    if (existingCustomer) {
      throw new EmailAlreadyExistsException(email);
    }

    const now = new Date();

    const customer = new CustomerModel(
      randomUUID(),
      dto.name,
      email,
      true,
      now,
      now,
    );

    try {
      return await this.customerRepository.save(customer);
    } catch (error) {
      // Carrera entre el findByEmail y el insert: si otra petición creó el mismo
      // email en paralelo, el constraint UNIQUE de BD lanza 23505 → 409.
      if (this.isUniqueViolation(error)) {
        throw new EmailAlreadyExistsException(email);
      }

      throw error;
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = error.driverError as { code?: string };

    return driverError.code === '23505';
  }
}
