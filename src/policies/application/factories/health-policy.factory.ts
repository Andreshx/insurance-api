import { Coverage } from '../../domain/models/coverage.vo';
import {
  DEFAULT_HEALTH_COPAY_RATE,
  DEFAULT_HEALTH_COVERAGE_AMOUNT,
  DEFAULT_HEALTH_WAITING_PERIOD_DAYS,
  POLICY_BASE_PREMIUMS,
} from '../../domain/models/policy-rating.constants';
import { PolicyBranch } from '../../domain/models/policy-branch.enum';
import { PolicyFactoryPort } from '../../domain/ports/policy-factory.port';

export class HealthPolicyFactory extends PolicyFactoryPort {
  getBranch(): PolicyBranch {
    return PolicyBranch.HEALTH;
  }

  createDefaultCoverage(): Coverage {
    return new Coverage({
      coverageAmount: DEFAULT_HEALTH_COVERAGE_AMOUNT,
      copayRate: DEFAULT_HEALTH_COPAY_RATE,
      waitingPeriodDays: DEFAULT_HEALTH_WAITING_PERIOD_DAYS,
    });
  }

  getBaseMonthlyPremium(): number {
    return POLICY_BASE_PREMIUMS.HEALTH;
  }
}