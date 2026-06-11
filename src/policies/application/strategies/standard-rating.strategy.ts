import { RatingStrategyName } from '../../domain/models/rating-strategy-name.enum';
import { RiskProfile } from '../../domain/models/risk-profile.vo';
import { RatingStrategyPort } from '../../domain/ports/rating-strategy.port';

export class StandardRatingStrategy extends RatingStrategyPort {
  getName(): RatingStrategyName {
    return RatingStrategyName.STANDARD;
  }

  validate(_riskProfile: RiskProfile): void {
    // STANDARD does not require extra validation.
  }

  calculatePremium(
    baseMonthlyPremium: number,
    _riskProfile: RiskProfile,
  ): number {
    return baseMonthlyPremium;
  }
}