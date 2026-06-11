import { Coverage } from './coverage.vo';
import { PolicyBranch } from './policy-branch.enum';
import { RatingStrategyName } from './rating-strategy-name.enum';
import { RiskProfile } from './risk-profile.vo';
import { PolicyStatePort } from '../states/policy-state.port';

export class PolicyModel {
  constructor(
    private readonly id: string,
    private readonly policyNumber: string,
    private readonly customerId: string,
    private readonly branch: PolicyBranch,
    private readonly ratingStrategy: RatingStrategyName,
    private readonly currentState: PolicyStatePort,
    private readonly coverage: Coverage,
    private readonly monthlyPremium: number,
    private readonly riskProfile: RiskProfile,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}

  getId(): string {
    return this.id;
  }

  getPolicyNumber(): string {
    return this.policyNumber;
  }

  getCustomerId(): string {
    return this.customerId;
  }

  getBranch(): PolicyBranch {
    return this.branch;
  }

  getRatingStrategy(): RatingStrategyName {
    return this.ratingStrategy;
  }

  getCurrentState(): PolicyStatePort {
    return this.currentState;
  }

  getCoverage(): Coverage {
    return this.coverage;
  }

  getMonthlyPremium(): number {
    return this.monthlyPremium;
  }

  getRiskProfile(): RiskProfile {
    return this.riskProfile;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  issue(): PolicyModel {
    return this.withState(this.currentState.issue());
  }

  activate(): PolicyModel {
    return this.withState(this.currentState.activate());
  }

  suspend(): PolicyModel {
    return this.withState(this.currentState.suspend());
  }

  cancel(): PolicyModel {
    return this.withState(this.currentState.cancel());
  }

  private withState(nextState: PolicyStatePort): PolicyModel {
    return new PolicyModel(
      this.id,
      this.policyNumber,
      this.customerId,
      this.branch,
      this.ratingStrategy,
      nextState,
      this.coverage,
      this.monthlyPremium,
      this.riskProfile,
      this.createdAt,
      new Date(),
    );
  }
}