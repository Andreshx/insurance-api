import { Inject, Injectable } from '@nestjs/common';
import { PolicyModel } from '../../domain/models/policy.model';
import { PolicyRepositoryPort } from '../../domain/ports/policy-repository.port';

@Injectable()
export class GetPoliciesByCustomerUseCase {
  constructor(
    @Inject(PolicyRepositoryPort)
    private readonly policyRepository: PolicyRepositoryPort,
  ) {}

  async execute(customerId: string): Promise<PolicyModel[]> {
    return this.policyRepository.findByCustomerId(customerId);
  }
}