import {
  RISK_SCORE_MAX,
  RISK_SCORE_MIN,
  RISK_SCORE_PROPERTY,
} from '../../domain/models/rating-strategy.constants';
import { RatingStrategyName } from '../../domain/models/rating-strategy-name.enum';
import { RiskProfile } from '../../domain/models/risk-profile.vo';
import { InvalidPolicyDataException } from '../../domain/exceptions/invalid-policy-data.exception';
import { RatingStrategyPort } from '../../domain/ports/rating-strategy.port';

export class RiskBasedRatingStrategy extends RatingStrategyPort {
  getName(): RatingStrategyName {
    return RatingStrategyName.RISK_BASED;
  }

  validate(riskProfile: RiskProfile): void {
    const riskScore = riskProfile.getNumberValue(RISK_SCORE_PROPERTY);

    if (riskScore === undefined) {
      throw new InvalidPolicyDataException(
        'riskProfile.riskScore is required for RISK_BASED rating strategy',
      );
    }

    if (riskScore < RISK_SCORE_MIN || riskScore > RISK_SCORE_MAX) {
      throw new InvalidPolicyDataException(
        'riskProfile.riskScore must be between 0 and 100',
      );
    }
  }

  calculatePremium(
    baseMonthlyPremium: number,
    riskProfile: RiskProfile,
  ): number {
    const riskScore = riskProfile.getNumberValue(RISK_SCORE_PROPERTY);

    if (riskScore === undefined) {
      throw new InvalidPolicyDataException(
        'riskProfile.riskScore is required for RISK_BASED rating strategy',
      );
    }

    return baseMonthlyPremium * (1 + riskScore / 100);
  }
}