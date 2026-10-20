import { Inject, Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { CustomerNotFoundException } from '../../domain/exceptions/customer-not-found.exception';
import { EmailAlreadyExistsException } from '../../domain/exceptions/email-already-exists.exception';
import { CustomerModel } from '../../domain/models/customer.model';
import { CustomerRepositoryPort } from '../../domain/ports/customer-repository.port';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject(CustomerRepositoryPort)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(id: string, dto: UpdateCustomerDto): Promise<CustomerModel> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new CustomerNotFoundException(id);
    }

    const name = dto.name ?? customer.getName();
    const email = dto.email
      ? dto.email.trim().toLowerCase()
      : customer.getEmail();

    if (email !== customer.getEmail()) {
      const existingCustomer = await this.customerRepository.findByEmail(email);

      if (existingCustomer) {
        throw new EmailAlreadyExistsException(email);
      }
    }

    const updatedCustomer = new CustomerModel(
      customer.getId(),
      name,
      email,
      customer.getIsActive(),
      customer.getCreatedAt(),
      new Date(),
    );

    try {
      return await this.customerRepository.save(updatedCustomer);
    } catch (error) {
      // Carrera entre el findByEmail y el update: si otra petición creó el
      // mismo email en paralelo, el constraint UNIQUE de BD lanza 23505 → 409.
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
