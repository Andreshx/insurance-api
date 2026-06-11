import { Injectable } from '@nestjs/common';
import { PolicyStatus } from '../../domain/models/policy-status.enum';
import { Coverage } from '../../domain/models/coverage.vo';
import { PolicyModel } from '../../domain/models/policy.model';
import { RiskProfile } from '../../domain/models/risk-profile.vo';
import { ActiveState } from '../../domain/states/active.state';
import { CancelledState } from '../../domain/states/cancelled.state';
import { IssuedState } from '../../domain/states/issued.state';
import { PolicyStatePort } from '../../domain/states/policy-state.port';
import { QuotedState } from '../../domain/states/quoted.state';
import { SuspendedState } from '../../domain/states/suspended.state';
import { PolicyTypeormEntity } from './policy.typeorm-entity';

@Injectable()
export class PolicyMapper {
  private readonly states = new Map<PolicyStatus, PolicyStatePort>([
    [PolicyStatus.QUOTED, new QuotedState()],
    [PolicyStatus.ISSUED, new IssuedState()],
    [PolicyStatus.ACTIVE, new ActiveState()],
    [PolicyStatus.SUSPENDED, new SuspendedState()],
    [PolicyStatus.CANCELLED, new CancelledState()],
  ]);

  toDomain(entity: PolicyTypeormEntity): PolicyModel {
    const state = this.states.get(entity.status);

    if (!state) {
      throw new Error(`Unsupported policy status: ${entity.status}`);
    }

    return new PolicyModel(
      entity.id,
      entity.policyNumber,
      entity.customerId,
      entity.branch,
      entity.ratingStrategy,
      state,
      new Coverage(entity.coverage),
      Number(entity.monthlyPremium),
      new RiskProfile(entity.riskProfile),
      entity.createdAt,
      entity.updatedAt,
    );
  }

  toEntity(model: PolicyModel): PolicyTypeormEntity {
    const entity = new PolicyTypeormEntity();

    entity.id = model.getId();
    entity.policyNumber = model.getPolicyNumber();
    entity.customerId = model.getCustomerId();
    entity.branch = model.getBranch();
    entity.ratingStrategy = model.getRatingStrategy();
    entity.status = model.getCurrentState().status;
    entity.coverage = model.getCoverage().getProperties();
    entity.monthlyPremium = model.getMonthlyPremium();
    entity.riskProfile = model.getRiskProfile().getProperties();
    entity.createdAt = model.getCreatedAt();
    entity.updatedAt = model.getUpdatedAt();

    return entity;
  }
}