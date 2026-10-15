import { Inject, Injectable } from '@nestjs/common';
import { PolicyNotFoundException } from '../../domain/exceptions/policy-not-found.exception';
import { PolicyModel } from '../../domain/models/policy.model';
import { PolicyRepositoryPort } from '../../domain/ports/policy-repository.port';

@Injectable()
export class GetPolicyByIdUseCase {
  constructor(
    @Inject(PolicyRepositoryPort)
    private readonly policyRepository: PolicyRepositoryPort,
  ) {}

  async execute(id: string): Promise<PolicyModel> {
    const policy = await this.policyRepository.findById(id);

    if (!policy) {
      throw new PolicyNotFoundException(id);
    }

    return policy;
  }
}
