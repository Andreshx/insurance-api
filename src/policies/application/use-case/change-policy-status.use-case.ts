import { Inject, Injectable } from '@nestjs/common';
import { EventPublisherPort } from '../../../shared/events/domain/ports/event-publisher.port';
import { InvalidStateTransitionException } from '../../domain/exceptions/invalid-state-transition.exception';
import { PolicyNotFoundException } from '../../domain/exceptions/policy-not-found.exception';
import { PolicyModel } from '../../domain/models/policy.model';
import { PolicyStatus } from '../../domain/models/policy-status.enum';
import { PolicyRepositoryPort } from '../../domain/ports/policy-repository.port';
import { ChangePolicyStatusDto } from '../dtos/change-policy-status.dto';

@Injectable()
export class ChangePolicyStatusUseCase {
  constructor(
    @Inject(PolicyRepositoryPort)
    private readonly policyRepository: PolicyRepositoryPort,

    @Inject(EventPublisherPort)
    private readonly eventPublisher: EventPublisherPort,
  ) {}

  async execute(
    policyId: string,
    dto: ChangePolicyStatusDto,
  ): Promise<PolicyModel> {
    const policy = await this.policyRepository.findById(policyId);

    if (!policy) {
      throw new PolicyNotFoundException(policyId);
    }

    const currentStatus = policy.getCurrentState().status;

    if (currentStatus === dto.targetStatus) {
      return policy;
    }

    const transitionActions = new Map<PolicyStatus, () => PolicyModel>([
      [PolicyStatus.ISSUED, () => policy.issue()],
      [PolicyStatus.ACTIVE, () => policy.activate()],
      [PolicyStatus.SUSPENDED, () => policy.suspend()],
      [PolicyStatus.CANCELLED, () => policy.cancel()],
    ]);

    const transitionAction = transitionActions.get(dto.targetStatus);

    if (!transitionAction) {
      throw new InvalidStateTransitionException(
        currentStatus,
        dto.targetStatus,
      );
    }

    const updatedPolicy = transitionAction();

    const savedPolicy = await this.policyRepository.save(updatedPolicy);

    await this.eventPublisher.publish(
      this.resolveTopic(currentStatus, savedPolicy.getCurrentState().status),
      {
        policyId: savedPolicy.getId(),
        policyNumber: savedPolicy.getPolicyNumber(),
        customerId: savedPolicy.getCustomerId(),
        branch: savedPolicy.getBranch(),
        oldStatus: currentStatus,
        newStatus: savedPolicy.getCurrentState().status,
        timestamp: new Date().toISOString(),
      },
    );

    return savedPolicy;
  }

  private resolveTopic(
    oldStatus: PolicyStatus,
    newStatus: PolicyStatus,
  ): string {
    if (newStatus === PolicyStatus.CANCELLED) {
      return 'policy.cancelled';
    }

    const topics = new Map<string, string>([
      [`${PolicyStatus.QUOTED}->${PolicyStatus.ISSUED}`, 'policy.issued'],
      [`${PolicyStatus.ISSUED}->${PolicyStatus.ACTIVE}`, 'policy.activated'],
      [`${PolicyStatus.ACTIVE}->${PolicyStatus.SUSPENDED}`, 'policy.suspended'],
      [
        `${PolicyStatus.SUSPENDED}->${PolicyStatus.ACTIVE}`,
        'policy.reactivated',
      ],
    ]);

    const topic = topics.get(`${oldStatus}->${newStatus}`);

    if (!topic) {
      throw new InvalidStateTransitionException(oldStatus, newStatus);
    }

    return topic;
  }
}
