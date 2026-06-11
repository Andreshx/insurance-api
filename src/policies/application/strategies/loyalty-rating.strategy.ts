import {
  CUSTOMER_SINCE_PROPERTY,
  LOYALTY_DISCOUNT_FACTOR,
  MIN_LOYALTY_YEARS,
} from '../../domain/models/rating-strategy.constants';
import { InvalidPolicyDataException } from '../../domain/exceptions/invalid-policy-data.exception';
import { RatingStrategyName } from '../../domain/models/rating-strategy-name.enum';
import { RiskProfile } from '../../domain/models/risk-profile.vo';
import { RatingStrategyPort } from '../../domain/ports/rating-strategy.port';

export class LoyaltyRatingStrategy extends RatingStrategyPort {
  getName(): RatingStrategyName {
    return RatingStrategyName.LOYALTY;
  }

  validate(riskProfile: RiskProfile): void {
    const customerSince = riskProfile.getNumberValue(CUSTOMER_SINCE_PROPERTY);

    if (customerSince === undefined) {
      throw new InvalidPolicyDataException(
        'riskProfile.customerSince is required for LOYALTY rating strategy',
      );
    }

    const currentYear = new Date().getFullYear();
    const customerAgeInYears = currentYear - customerSince;

    if (customerAgeInYears < MIN_LOYALTY_YEARS) {
      throw new InvalidPolicyDataException(
        'Customer must have at least 2 years of loyalty',
      );
    }
  }

  calculatePremium(
    baseMonthlyPremium: number,
    riskProfile: RiskProfile,
  ): number {
    this.validate(riskProfile);

    return baseMonthlyPremium * LOYALTY_DISCOUNT_FACTOR;
  }
}