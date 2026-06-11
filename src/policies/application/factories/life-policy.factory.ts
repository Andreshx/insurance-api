import { Coverage } from '../../domain/models/coverage.vo';
import {
  DEFAULT_LIFE_BENEFICIARY_REQUIRED,
  DEFAULT_LIFE_COVERAGE_AMOUNT,
  DEFAULT_TERM_MONTHS,
  POLICY_BASE_PREMIUMS,
} from '../../domain/models/policy-rating.constants';
import { PolicyBranch } from '../../domain/models/policy-branch.enum';
import { PolicyFactoryPort } from '../../domain/ports/policy-factory.port';

export class LifePolicyFactory extends PolicyFactoryPort {
  getBranch(): PolicyBranch {
    return PolicyBranch.LIFE;
  }

  createDefaultCoverage(): Coverage {
    return new Coverage({
      coverageAmount: DEFAULT_LIFE_COVERAGE_AMOUNT,
      beneficiaryRequired: DEFAULT_LIFE_BENEFICIARY_REQUIRED,
      termMonths: DEFAULT_TERM_MONTHS,
    });
  }

  getBaseMonthlyPremium(): number {
    return POLICY_BASE_PREMIUMS.LIFE;
  }
}