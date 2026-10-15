import { RatingStrategyName } from '../../domain/models/rating-strategy-name.enum';
import { RiskProfile } from '../../domain/models/risk-profile.vo';
import { StandardRatingStrategy } from './standard-rating.strategy';

describe('StandardRatingStrategy', () => {
  const strategy = new StandardRatingStrategy();

  it('should return STANDARD name', () => {
    expect(strategy.getName()).toBe(RatingStrategyName.STANDARD);
  });

  it('validate should not throw for any risk profile', () => {
    expect(() => strategy.validate(new RiskProfile({}))).not.toThrow();
    expect(() =>
      strategy.validate(new RiskProfile({ riskScore: 50 })),
    ).not.toThrow();
    expect(() =>
      strategy.validate(new RiskProfile({ customerSince: 2020 })),
    ).not.toThrow();
  });

  it('calculatePremium should return base premium unchanged', () => {
    const base = 120_000;
    expect(strategy.calculatePremium(base, new RiskProfile({}))).toBe(base);
    expect(
      strategy.calculatePremium(base, new RiskProfile({ riskScore: 99 })),
    ).toBe(base);
  });
});
