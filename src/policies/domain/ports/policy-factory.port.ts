import { Coverage } from '../models/coverage.vo';
import { PolicyBranch } from '../models/policy-branch.enum';

export abstract class PolicyFactoryPort {
  abstract getBranch(): PolicyBranch;

  abstract createDefaultCoverage(): Coverage;

  abstract getBaseMonthlyPremium(): number;
}