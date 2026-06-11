import { RatingStrategyName } from '../models/rating-strategy-name.enum';
import { RiskProfile } from '../models/risk-profile.vo';

export abstract class RatingStrategyPort {
  abstract getName(): RatingStrategyName;

  abstract validate(riskProfile: RiskProfile): void;

  abstract calculatePremium(
    baseMonthlyPremium: number,
    riskProfile: RiskProfile,
  ): number;
}