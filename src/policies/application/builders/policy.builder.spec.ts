import { PolicyBranch } from '../../domain/models/policy-branch.enum';
import { RatingStrategyName } from '../../domain/models/rating-strategy-name.enum';
import { RiskProfile } from '../../domain/models/risk-profile.vo';
import { Coverage } from '../../domain/models/coverage.vo';
import { InvalidPolicyDataException } from '../../domain/exceptions/invalid-policy-data.exception';
import { PolicyBuilder } from './policy.builder';

describe('PolicyBuilder', () => {
  const validProps = {
    customerId: 'customer-123',
    policyNumber: 'POL-20260101-000001',
    branch: PolicyBranch.AUTO,
    ratingStrategy: RatingStrategyName.STANDARD,
    coverage: new Coverage({ coverageAmount: 80_000_000 }),
    monthlyPremium: 120_000,
    riskProfile: new RiskProfile({}),
  };

  it('should build a valid PolicyModel', () => {
    const builder = new PolicyBuilder()
      .forCustomer(validProps.customerId)
      .withPolicyNumber(validProps.policyNumber)
      .ofBranch(validProps.branch)
      .withRatingStrategy(validProps.ratingStrategy)
      .withCoverage(validProps.coverage)
      .withMonthlyPremium(validProps.monthlyPremium)
      .withRiskProfile(validProps.riskProfile);

    const policy = builder.build();

    expect(policy.getId()).toBeDefined();
    expect(policy.getPolicyNumber()).toBe(validProps.policyNumber);
    expect(policy.getCustomerId()).toBe(validProps.customerId);
    expect(policy.getBranch()).toBe(validProps.branch);
    expect(policy.getRatingStrategy()).toBe(validProps.ratingStrategy);
    expect(policy.getCurrentState().status).toBe('QUOTED');
    expect(policy.getMonthlyPremium()).toBe(validProps.monthlyPremium);
    expect(policy.getCreatedAt()).toBeInstanceOf(Date);
    expect(policy.getUpdatedAt()).toBeInstanceOf(Date);
  });

  it('should start in QUOTED status', () => {
    const policy = new PolicyBuilder()
      .forCustomer(validProps.customerId)
      .withPolicyNumber(validProps.policyNumber)
      .ofBranch(validProps.branch)
      .withRatingStrategy(validProps.ratingStrategy)
      .withCoverage(validProps.coverage)
      .withMonthlyPremium(validProps.monthlyPremium)
      .withRiskProfile(validProps.riskProfile)
      .build();

    expect(policy.getCurrentState().status).toBe('QUOTED');
  });

  it('should throw when customerId is missing', () => {
    expect(() =>
      new PolicyBuilder()
        .withPolicyNumber(validProps.policyNumber)
        .ofBranch(validProps.branch)
        .withRatingStrategy(validProps.ratingStrategy)
        .withCoverage(validProps.coverage)
        .withMonthlyPremium(validProps.monthlyPremium)
        .withRiskProfile(validProps.riskProfile)
        .build(),
    ).toThrow(InvalidPolicyDataException);
  });

  it('should throw when policyNumber is missing', () => {
    expect(() =>
      new PolicyBuilder()
        .forCustomer(validProps.customerId)
        .ofBranch(validProps.branch)
        .withRatingStrategy(validProps.ratingStrategy)
        .withCoverage(validProps.coverage)
        .withMonthlyPremium(validProps.monthlyPremium)
        .withRiskProfile(validProps.riskProfile)
        .build(),
    ).toThrow(InvalidPolicyDataException);
  });

  it('should throw when branch is missing', () => {
    expect(() =>
      new PolicyBuilder()
        .forCustomer(validProps.customerId)
        .withPolicyNumber(validProps.policyNumber)
        .withRatingStrategy(validProps.ratingStrategy)
        .withCoverage(validProps.coverage)
        .withMonthlyPremium(validProps.monthlyPremium)
        .withRiskProfile(validProps.riskProfile)
        .build(),
    ).toThrow(InvalidPolicyDataException);
  });

  it('should throw when ratingStrategy is missing', () => {
    expect(() =>
      new PolicyBuilder()
        .forCustomer(validProps.customerId)
        .withPolicyNumber(validProps.policyNumber)
        .ofBranch(validProps.branch)
        .withCoverage(validProps.coverage)
        .withMonthlyPremium(validProps.monthlyPremium)
        .withRiskProfile(validProps.riskProfile)
        .build(),
    ).toThrow(InvalidPolicyDataException);
  });

  it('should throw when coverage is missing', () => {
    expect(() =>
      new PolicyBuilder()
        .forCustomer(validProps.customerId)
        .withPolicyNumber(validProps.policyNumber)
        .withRatingStrategy(validProps.ratingStrategy)
        .withMonthlyPremium(validProps.monthlyPremium)
        .withRiskProfile(validProps.riskProfile)
        .build(),
    ).toThrow(InvalidPolicyDataException);
  });

  it('should throw when monthlyPremium is undefined', () => {
    expect(() =>
      new PolicyBuilder()
        .forCustomer(validProps.customerId)
        .withPolicyNumber(validProps.policyNumber)
        .ofBranch(validProps.branch)
        .withRatingStrategy(validProps.ratingStrategy)
        .withCoverage(validProps.coverage)
        .withRiskProfile(validProps.riskProfile)
        .build(),
    ).toThrow(InvalidPolicyDataException);
  });

  it('should throw when riskProfile is missing', () => {
    expect(() =>
      new PolicyBuilder()
        .forCustomer(validProps.customerId)
        .withPolicyNumber(validProps.policyNumber)
        .ofBranch(validProps.branch)
        .withRatingStrategy(validProps.ratingStrategy)
        .withCoverage(validProps.coverage)
        .withMonthlyPremium(validProps.monthlyPremium)
        .build(),
    ).toThrow(InvalidPolicyDataException);
  });
});
