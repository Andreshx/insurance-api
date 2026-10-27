import { Injectable, OnModuleInit } from '@nestjs/common';
import { PolicyRepositoryPort } from '../../domain/ports/policy-repository.port';
import { PolicyNumberSequencer } from '../../../shared/singletons/policy-number-sequencer';

@Injectable()
export class PolicyNumberInitializer implements OnModuleInit {
  constructor(private readonly policyRepository: PolicyRepositoryPort) {}

  async onModuleInit(): Promise<void> {
    const sequencer = PolicyNumberSequencer.getInstance();

    const policies = await this.policyRepository.findAll();

    if (policies.length === 0) {
      return;
    }

    // Extraer el número de secuencia más alto de los policy_number existentes
    // Formato: POL-YYYYMMDD-XXXXXX
    let maxSequence = 0;
    for (const policy of policies) {
      const match = policy.getPolicyNumber().match(/(\d{6})$/);
      if (match) {
        const seq = Number.parseInt(match[1], 10);
        if (seq > maxSequence) {
          maxSequence = seq;
        }
      }
    }

    // Inicializar el secuenciador desde el siguiente número disponible
    sequencer.setSequence(maxSequence + 1);
  }
}
