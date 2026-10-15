import { RatingStrategyName } from '../../domain/models/rating-strategy-name.enum';
import { RiskProfile } from '../../domain/models/risk-profile.vo';
import { InvalidPolicyDataException } from '../../domain/exceptions/invalid-policy-data.exception';
import { LoyaltyRatingStrategy } from './loyalty-rating.strategy';

describe('LoyaltyRatingStrategy', () => {
  const strategy = new LoyaltyRatingStrategy();
  const currentYear = new Date().getFullYear();

  it('should return LOYALTY name', () => {
    expect(strategy.getName()).toBe(RatingStrategyName.LOYALTY);
  });

  describe('validate', () => {
    it('should not throw when customerSince is 2 or more years ago', () => {
      expect(() =>
        strategy.validate(new RiskProfile({ customerSince: currentYear - 2 })),
      ).not.toThrow();
      expect(() =>
        strategy.validate(new RiskProfile({ customerSince: currentYear - 5 })),
      ).not.toThrow();
    });

    it('should throw when customerSince is missing', () => {
      expect(() => strategy.validate(new RiskProfile({}))).toThrow(
        InvalidPolicyDataException,
      );
    });

    it('should throw when customerSince is less than 2 years ago', () => {
      expect(() =>
        strategy.validate(new RiskProfile({ customerSince: currentYear - 1 })),
      ).toThrow(InvalidPolicyDataException);
      expect(() =>
        strategy.validate(new RiskProfile({ customerSince: currentYear })),
      ).toThrow(InvalidPolicyDataException);
    });

    it('should throw when customerSince is not a number', () => {
      expect(() =>
        strategy.validate(new RiskProfile({ customerSince: '2020' })),
      ).toThrow(InvalidPolicyDataException);
    });
  });

  describe('calculatePremium', () => {
    const base = 120_000;

    it('should apply 0.85 discount factor', () => {
      const profile = new RiskProfile({ customerSince: currentYear - 5 });
      expect(strategy.calculatePremium(base, profile)).toBe(base * 0.85);
    });

    it('should throw when customerSince is missing', () => {
      expect(() =>
        strategy.calculatePremium(base, new RiskProfile({})),
      ).toThrow(InvalidPolicyDataException);
    });
  });
});
