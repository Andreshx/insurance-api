import { Coverage } from '../../domain/models/coverage.vo';
import {
  DEFAULT_HOME_COVERAGE_AMOUNT,
  DEFAULT_HOME_DEDUCTIBLE,
  DEFAULT_TERM_MONTHS,
  POLICY_BASE_PREMIUMS,
} from '../../domain/models/policy-rating.constants';
import { PolicyBranch } from '../../domain/models/policy-branch.enum';
import { PolicyFactoryPort } from '../../domain/ports/policy-factory.port';

export class HomePolicyFactory extends PolicyFactoryPort {
  getBranch(): PolicyBranch {
    return PolicyBranch.HOME;
  }

  createDefaultCoverage(): Coverage {
    return new Coverage({
      coverageAmount: DEFAULT_HOME_COVERAGE_AMOUNT,
      deductible: DEFAULT_HOME_DEDUCTIBLE,
      termMonths: DEFAULT_TERM_MONTHS,
    });
  }

  getBaseMonthlyPremium(): number {
    return POLICY_BASE_PREMIUMS.HOME;
  }
}