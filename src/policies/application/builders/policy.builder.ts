import { randomUUID } from 'crypto';
import { Coverage } from '../../domain/models/coverage.vo';
import { PolicyBranch } from '../../domain/models/policy-branch.enum';
import { PolicyModel } from '../../domain/models/policy.model';
import { QuotedState } from '../../domain/states/quoted.state';
import { RatingStrategyName } from '../../domain/models/rating-strategy-name.enum';
import { RiskProfile } from '../../domain/models/risk-profile.vo';
import { InvalidPolicyDataException } from '../../domain/exceptions/invalid-policy-data.exception';

export class PolicyBuilder {
  private customerId?: string;
  private policyNumber?: string;
  private branch?: PolicyBranch;
  private ratingStrategy?: RatingStrategyName;
  private coverage?: Coverage;
  private monthlyPremium?: number;
  private riskProfile?: RiskProfile;

  forCustomer(customerId: string): this {
    this.customerId = customerId;
    return this;
  }

  withPolicyNumber(policyNumber: string): this {
    this.policyNumber = policyNumber;
    return this;
  }

  ofBranch(branch: PolicyBranch): this {
    this.branch = branch;
    return this;
  }

  withRatingStrategy(ratingStrategy: RatingStrategyName): this {
    this.ratingStrategy = ratingStrategy;
    return this;
  }

  withCoverage(coverage: Coverage): this {
    this.coverage = coverage;
    return this;
  }

  withMonthlyPremium(monthlyPremium: number): this {
    this.monthlyPremium = monthlyPremium;
    return this;
  }

  withRiskProfile(riskProfile: RiskProfile): this {
    this.riskProfile = riskProfile;
    return this;
  }

  build(): PolicyModel {
    if (!this.customerId) {
      throw new InvalidPolicyDataException('customerId is required');
    }

    if (!this.policyNumber) {
      throw new InvalidPolicyDataException('policyNumber is required');
    }

    if (!this.branch) {
      throw new InvalidPolicyDataException('branch is required');
    }

    if (!this.ratingStrategy) {
      throw new InvalidPolicyDataException('ratingStrategy is required');
    }

    if (!this.coverage) {
      throw new InvalidPolicyDataException('coverage is required');
    }

    if (this.monthlyPremium === undefined) {
      throw new InvalidPolicyDataException('monthlyPremium is required');
    }

    if (!this.riskProfile) {
      throw new InvalidPolicyDataException('riskProfile is required');
    }

    const now = new Date();

    return new PolicyModel(
      randomUUID(),
      this.policyNumber,
      this.customerId,
      this.branch,
      this.ratingStrategy,
      new QuotedState(),
      this.coverage,
      this.monthlyPremium,
      this.riskProfile,
      now,
      now,
    );
  }
}