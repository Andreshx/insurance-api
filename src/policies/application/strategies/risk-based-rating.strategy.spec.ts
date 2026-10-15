import { RatingStrategyName } from '../../domain/models/rating-strategy-name.enum';
import { RiskProfile } from '../../domain/models/risk-profile.vo';
import { InvalidPolicyDataException } from '../../domain/exceptions/invalid-policy-data.exception';
import { RiskBasedRatingStrategy } from './risk-based-rating.strategy';

describe('RiskBasedRatingStrategy', () => {
  const strategy = new RiskBasedRatingStrategy();

  it('should return RISK_BASED name', () => {
    expect(strategy.getName()).toBe(RatingStrategyName.RISK_BASED);
  });

  describe('validate', () => {
    it('should not throw when riskScore is between 0 and 100', () => {
      expect(() =>
        strategy.validate(new RiskProfile({ riskScore: 0 })),
      ).not.toThrow();
      expect(() =>
        strategy.validate(new RiskProfile({ riskScore: 50 })),
      ).not.toThrow();
      expect(() =>
        strategy.validate(new RiskProfile({ riskScore: 100 })),
      ).not.toThrow();
    });

    it('should throw when riskScore is missing', () => {
      expect(() => strategy.validate(new RiskProfile({}))).toThrow(
        InvalidPolicyDataException,
      );
      expect(() =>
        strategy.validate(new RiskProfile({ customerSince: 2020 })),
      ).toThrow(InvalidPolicyDataException);
    });

    it('should throw when riskScore is out of range', () => {
      expect(() =>
        strategy.validate(new RiskProfile({ riskScore: -1 })),
      ).toThrow(InvalidPolicyDataException);
      expect(() =>
        strategy.validate(new RiskProfile({ riskScore: 101 })),
      ).toThrow(InvalidPolicyDataException);
    });

    it('should throw when riskScore is not a number', () => {
      expect(() =>
        strategy.validate(new RiskProfile({ riskScore: 'alto' })),
      ).toThrow(InvalidPolicyDataException);
    });
  });

  describe('calculatePremium', () => {
    const base = 120_000;

    it('should return base when score is 0', () => {
      expect(
        strategy.calculatePremium(base, new RiskProfile({ riskScore: 0 })),
      ).toBe(base);
    });

    it('should apply multiplier for score 50', () => {
      expect(
        strategy.calculatePremium(base, new RiskProfile({ riskScore: 50 })),
      ).toBe(base * 1.5);
    });

    it('should double base when score is 100', () => {
      expect(
        strategy.calculatePremium(base, new RiskProfile({ riskScore: 100 })),
      ).toBe(base * 2);
    });

    it('should throw when riskScore is missing', () => {
      expect(() =>
        strategy.calculatePremium(base, new RiskProfile({})),
      ).toThrow(InvalidPolicyDataException);
    });
  });
});
