import { PolicyBranch } from '../models/policy-branch.enum';

export class UnsupportedBranchException extends Error {
  constructor(branch: PolicyBranch | string) {
    super(`Unsupported policy branch: ${branch}`);
    this.name = 'UnsupportedBranchException';
  }
}